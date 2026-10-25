import { expect, type Page } from '@playwright/test';

// Focused computed-text contrast check; this does not replace a complete WCAG audit.
export async function expectReadableContrast(page: Page) {
  const failures = await page.evaluate(() => {
    const rgba = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = (color: number[]) =>
      color
        .slice(0, 3)
        .map((value) => {
          const channel = value / 255;
          return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
          0,
        );
    const results: {
      text: string;
      element: string;
      foreground: string;
      ratio: number;
    }[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.trim();
      const element = walker.currentNode.parentElement;
      if (
        !text ||
        !(element instanceof HTMLElement) ||
        element.closest(
          '[aria-hidden="true"],.sr-only,option,button:disabled,select:disabled',
        ) ||
        !element.getClientRects().length
      )
        continue;
      const bounds = element.getBoundingClientRect();
      if (
        bounds.width < 2 ||
        bounds.height < 2 ||
        bounds.right < 0 ||
        bounds.left > innerWidth
      )
        continue;
      const style = getComputedStyle(element);
      if (style.visibility !== 'visible') continue;
      const chain: HTMLElement[] = [];
      let ancestor: HTMLElement | null = element;
      while (ancestor) {
        chain.push(ancestor);
        ancestor = ancestor.parentElement;
      }
      if (
        chain.some(
          (item) =>
            getComputedStyle(item).backgroundImage !== 'none' ||
            Number(getComputedStyle(item).opacity) < 1,
        )
      )
        continue;
      let background = [255, 255, 255];
      for (const item of chain.reverse()) {
        const color = rgba(getComputedStyle(item).backgroundColor);
        if (color.length >= 3) {
          const alpha = color[3] ?? 1;
          background = background.map(
            (value, index) => color[index] * alpha + value * (1 - alpha),
          );
        }
      }
      const foreground = rgba(style.color);
      if (foreground.length < 3) continue;
      const foregroundLuminance = luminance(foreground);
      const backgroundLuminance = luminance(background);
      const ratio =
        (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
      const large =
        parseFloat(style.fontSize) >= 24 ||
        (parseFloat(style.fontSize) >= 18.66 &&
          Number(style.fontWeight) >= 700);
      if (ratio + 0.01 < (large ? 3 : 4.5))
        results.push({
          text: text.slice(0, 55),
          element: element.tagName.toLowerCase() + '.' + element.className,
          foreground: style.color,
          ratio: Math.round(ratio * 100) / 100,
        });
    }
    return results;
  });
  expect(
    failures,
    'Visible text must meet minimum contrast on the checked solid backgrounds',
  ).toEqual([]);
}
