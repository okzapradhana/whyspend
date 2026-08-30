-- Household-scoped owner identity projection: exposes only userId + displayName for members
-- household members can read each other's identities without accessing private User rows
-- Uses security_invoker=false so view bypasses User self-only RLS but view's own WHERE restricts to callers' households

CREATE OR REPLACE VIEW public."household_member_identity"
WITH (security_invoker = false) AS
SELECT
  hm."householdId" AS "householdId",
  u.id AS "userId",
  u."displayName" AS "displayName"
FROM public."User" u
JOIN public."HouseholdMember" hm ON hm."userId" = u.id
WHERE hm."householdId" IN (SELECT public.get_user_households());

-- Grants: allow authenticated to read the projection (anon blocked)
GRANT SELECT ON public."household_member_identity" TO authenticated;
REVOKE ALL ON public."household_member_identity" FROM anon;

-- Also ensure the underlying get_user_households function is usable by authenticated
GRANT EXECUTE ON FUNCTION public.get_user_households() TO authenticated;
