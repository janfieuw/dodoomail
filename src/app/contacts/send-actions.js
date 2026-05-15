"use server";

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function sendMailToSelected(formData) {
  const contactIds = formData.getAll("contactIds");

  if (contactIds.length === 0) {
    return;
  }

  const contacts = await prisma.contact.findMany({
    where: {
      id: {
        in: contactIds,
      },
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "template",
    "index.html"
  );

  let baseHtml = fs.readFileSync(
    templatePath,
    "utf8"
  );

  baseHtml = baseHtml.replaceAll(
    'src="head.png"',
    'src="cid:headimage"'
  );

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  for (const contact of contacts) {
    const trackingId = crypto.randomUUID();

    const trackingPixel = `
      <img
        src="${process.env.APP_URL}/api/track-open?id=${trackingId}"
        width="1"
        height="1"
        style="display:none;"
      />
    `;

    const html = baseHtml.replace(
      "</body>",
      `${trackingPixel}</body>`
    );

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: contact.email,
      subject:
        "Eenvoudige tijdsregistratie voor KMO’s",

      html,

      attachments: [
        {
          filename: "head.png",
          path: path.join(
            process.cwd(),
            "template",
            "head.png"
          ),
          cid: "headimage",
        },
      ],
    });

    await prisma.mailSendLog.create({
      data: {
        contactId: contact.id,
        email: contact.email,
        subject:
          "Eenvoudige tijdsregistratie voor KMO’s",
        trackingId,
        status: "sent",
      },
    });

    await prisma.contact.update({
      where: {
        id: contact.id,
      },
      data: {
        status: "verstuurd",
        lastSentAt: new Date(),
      },
    });
  }

  revalidatePath("/contacts");
}