import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function POST(request) {
  const formData = await request.formData();

  await prisma.contact.create({
    data: {
      companyName: formData.get("companyName"),
      email: formData.get("email"),
      sector: formData.get("sector") || null,
      postalCode: formData.get("postalCode") || null,
      note: formData.get("note") || null,
      status: formData.get("status") || "lead",
    },
  });

  redirect("/mail/contacts");
}