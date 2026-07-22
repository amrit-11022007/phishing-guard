import type { EmailData } from "./definitions";

function extractEmailData(container: HTMLElement): EmailData {
  const sender = container.querySelector<HTMLElement>("span[email]");
  const senderEmail = sender?.getAttribute("email") ?? null;
  const senderName = sender?.getAttribute("name") ?? null;

  const subject =
    container.querySelector<HTMLElement>("h2[data-thread-perm-id]")
      ?.innerText ?? null;

  const bodyEl = container.querySelector<HTMLElement>(
    'div[role="listitem"] div.a3s',
  );

  const links: string[] = Array.from(
    bodyEl?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [],
  ).map((a) => a.href);

  return {
    senderEmail,
    senderName,
    subject,
    body: bodyEl?.innerText ?? null,
    links,
  };
}

let lastSubject: string | null = null;

const observer = new MutationObserver(() => {
  const emailContainer =
    document.querySelector<HTMLElement>('div[role="main"]');
  if (!emailContainer) return;

  const data = extractEmailData(emailContainer);
  if (data.subject && data.subject !== lastSubject) {
    lastSubject = data.subject;
    console.log("[Phishing Detector]", data);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
