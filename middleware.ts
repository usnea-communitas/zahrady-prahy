import { NextResponse, type NextRequest } from 'next/server';

import { LOCALE_HEADER, readUrlLocale } from '@/lib/i18n';

/**
 * The layout cannot read the query string, so the language a link asks for
 * (`?lang=cs`) reaches it in a request header and the page is rendered in
 * that language from the first byte.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete(LOCALE_HEADER);
  const locale = readUrlLocale(request.nextUrl);
  if (locale) headers.set(LOCALE_HEADER, locale);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: '/' };
