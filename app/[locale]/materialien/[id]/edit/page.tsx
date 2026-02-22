import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

// Server-side redirect from /edit to /bearbeiten (canonical URL)
export default async function EditRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/materialien/${id}/bearbeiten`);
}
