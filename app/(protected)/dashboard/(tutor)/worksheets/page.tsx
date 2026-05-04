import WorksheetsList from "@/components/tutor/WorksheetsList";
import { createClient } from "@/lib/supabase/server";

const Worksheets = async () => {
  const supabase = await createClient()
  const fetchFiles = await supabase.storage.from("worksheets").list()
  console.log(fetchFiles) 
  return (
    <>
      <WorksheetsList />
    </>
  );
};

export default Worksheets;


