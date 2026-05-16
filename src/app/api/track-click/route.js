import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const trackingId = searchParams.get("id");
  const url = searchParams.get("url");

  if (!trackingId || !url) {
    return new Response("Missing tracking data", { status: 400 });
  }

  const sendLog = await prisma.mailSendLog.findUnique({
    where: { trackingId },
  });

  if (sendLog) {
    await prisma.mailClick.create({
      data: {
        contactId: sendLog.contactId,
        trackingId,
        url,
      },
    });

    await prisma.contact.update({
      where: { id: sendLog.contactId },
      data: { status: "geklikt" },
    });
  }

  redirect(url);
}