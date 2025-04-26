import ChatCard from "@/components/page/ChatCard";

export default function InitialPage({
  setPage,
}: {
  setPage: (page: string) => void;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center min-h-screen p-4 md:p-8 gap-4">
      <h1 className="text-2xl font-bold mb-2">Tell Us Everything or Else</h1>
      <ChatCard setPage={setPage} />
    </div>
  );
}
