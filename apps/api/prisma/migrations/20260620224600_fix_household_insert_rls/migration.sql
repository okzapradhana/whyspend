-- Drop the existing policies
DROP POLICY IF EXISTS "household_member_access" ON "Household";
DROP POLICY IF EXISTS "household_insert_policy" ON "Household";

-- Create unified policy to allow SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "household_member_access" ON "Household"
  FOR ALL TO authenticated
  USING (
    id IN (
      SELECT "householdId" FROM "HouseholdMember" 
      WHERE "userId" = (SELECT auth.uid())::text
    )
    OR
    id NOT IN (
      SELECT "householdId" FROM "HouseholdMember"
    )
  );
