-- Keep invitation row updates within the two supported client mutation shapes.
-- The owner remains able to manage their invitation rows as before.
CREATE OR REPLACE FUNCTION public.guard_household_invitation_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  caller_email text := lower(NULLIF(auth.jwt() ->> 'email', ''));
BEGIN
  -- Household owners already have invitation-management access. Preserve that
  -- behavior while protecting the invited-user and accepted-user paths below.
  IF auth.uid() IS NOT NULL
     AND OLD."invitedByUserId" = auth.uid()::text THEN
    RETURN NEW;
  END IF;

  -- These fields identify the invitation and may not move it to another
  -- household, recipient, owner, or creation record.
  IF NEW."id" IS DISTINCT FROM OLD."id"
     OR NEW."householdId" IS DISTINCT FROM OLD."householdId"
     OR NEW."email" IS DISTINCT FROM OLD."email"
     OR NEW."invitedByUserId" IS DISTINCT FROM OLD."invitedByUserId"
     OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt" THEN
    RAISE EXCEPTION 'Household invitation identity fields cannot be changed'
      USING ERRCODE = 'check_violation';
  END IF;

  -- An invited user may refresh only an expired pending invitation. The JWT
  -- email check keeps an owner/accepted user from using this mutation shape.
  IF NEW."token" IS DISTINCT FROM OLD."token"
     OR NEW."expiresAt" IS DISTINCT FROM OLD."expiresAt" THEN
    IF OLD."status" <> 'pending'
       OR OLD."expiresAt" > CURRENT_TIMESTAMP
       OR OLD."acceptedByUserId" IS NOT NULL
       OR OLD."acceptedAt" IS NOT NULL
       OR NEW."token" IS NOT DISTINCT FROM OLD."token"
       OR NEW."expiresAt" IS NOT DISTINCT FROM OLD."expiresAt"
       OR NEW."updatedAt" IS NOT DISTINCT FROM OLD."updatedAt"
       OR NEW."status" IS DISTINCT FROM OLD."status"
       OR NEW."acceptedByUserId" IS DISTINCT FROM OLD."acceptedByUserId"
       OR NEW."acceptedAt" IS DISTINCT FROM OLD."acceptedAt"
       OR caller_email IS NULL
       OR lower(OLD."email") <> caller_email THEN
      RAISE EXCEPTION 'Invalid household invitation refresh'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  -- Acceptance may move a pending invitation to accepted and set the three
  -- acceptance fields. Prisma may also update updatedAt automatically.
  IF NEW."status" IS DISTINCT FROM OLD."status"
     OR NEW."acceptedByUserId" IS DISTINCT FROM OLD."acceptedByUserId"
     OR NEW."acceptedAt" IS DISTINCT FROM OLD."acceptedAt" THEN
    IF OLD."status" <> 'pending'
       OR OLD."expiresAt" <= CURRENT_TIMESTAMP
       OR NEW."status" <> 'accepted'
       OR NEW."token" IS DISTINCT FROM OLD."token"
       OR NEW."expiresAt" IS DISTINCT FROM OLD."expiresAt"
       OR NEW."acceptedByUserId" IS NULL
       OR NEW."acceptedAt" IS NULL
       OR (caller_email IS NOT NULL AND lower(OLD."email") <> caller_email)
       OR (auth.uid() IS NOT NULL AND NEW."acceptedByUserId" IS DISTINCT FROM auth.uid()::text) THEN
      RAISE EXCEPTION 'Invalid household invitation acceptance'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  -- updatedAt alone, or any other non-owner mutation, is not a supported
  -- invitation operation.
  IF NEW."updatedAt" IS DISTINCT FROM OLD."updatedAt" THEN
    RAISE EXCEPTION 'Invalid household invitation update'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS household_invitation_update_guard ON public."HouseholdInvitation";

CREATE TRIGGER household_invitation_update_guard
BEFORE UPDATE ON public."HouseholdInvitation"
FOR EACH ROW
EXECUTE FUNCTION public.guard_household_invitation_update();
