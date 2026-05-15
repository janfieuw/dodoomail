"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createContact(formData) {
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

  revalidatePath("/contacts");
}