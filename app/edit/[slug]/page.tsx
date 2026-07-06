import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditMemorialClient from "@/components/EditMemorialClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMemorialForEdit } from "@/lib/data";

export default async function EditMemorialPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/edit/${params.slug}`);
  }

  const memorial = await getMemorialForEdit(params.slug, session.user.id);

  if (!memorial) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EditMemorialClient memorial={memorial} />
      <Footer />
    </div>
  );
}
