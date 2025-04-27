import ChatCard from "@/components/page/ChatCard";
import { Survey } from "@/utils/types";

export default function InitialPage({
  setPage,
  setSurvey,
}: {
  setPage: (page: number) => void;
  setSurvey: (survey: Survey) => void;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center min-h-screen p-4 md:p-8 gap-4">
      <h1 className="text-2xl font-bold mb-2">title hi</h1>
      <ChatCard setPage={setPage} setSurvey={setSurvey} />
    </div>
  );
}
