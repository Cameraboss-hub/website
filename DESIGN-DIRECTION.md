# CameraBoss visual direction

**Chosen reference:** [Hugo & Marie on Refero Styles](https://styles.refero.design/style/58a36cba-3fc4-48fa-a7d9-7f14592b7857). Refero provides a design-system reference, not a ready-made WordPress theme. Use it as a visual foundation, never copy its images, text, or proprietary fonts.

## Why this one

It treats the site like a gallery catalog: photographs supply the colour, typography and fine rules provide structure, and controls recede. This fits CameraBoss's weddings and portraits and the requested Reem-style image-rich homepage better than a dark contact sheet or a software-style card layout.

Other references assessed: [Alt–Border](https://styles.refero.design/style/5fd2cdc0-05ac-4290-b67c-72e7525a532c) has excellent editorial type but lets the opening text overpower the photographs; [Atelier Deux-Cé](https://styles.refero.design/style/d531f0ec-ea94-4a40-b568-3073ff2bd8ed) has a strong split-image opening but too many tinted surfaces for CameraBoss; [Julia Krantz](https://styles.refero.design/style/92857b05-1c01-4c7a-b196-beb4e4871998) is visually dense and very dark; [Basha-Franklin](https://styles.refero.design/style/ffd5932b-c78c-491b-b03e-78ebeb6b0a1b) feels more like an architectural portfolio.

## CameraBoss application

- Open with three CameraBoss photographs: a bridal portrait, a ceremony exit, and a traditional-wedding portrait. On a phone, the ceremony image leads and the portraits form a second row.
- Put the statement on white below the images. Keep the existing SEO title, canonical URL, navigation routes, and substantive page copy.
- Use Bodoni Moda for expressive headlines and Manrope for utility text. Both are already loaded by the site. Avoid the reference's proprietary fonts.
- Keep the homepage portfolio rich in pictures, caption-free, and accessible through descriptive image alt text and link labels. Client names may appear on their own gallery pages, not as homepage overlays.
- Use sharp image edges, fine rules, and plain text links. No arrows, pointer graphics, filled CTA blocks, shadows, gradients, rounded cards, or decorative motion in the homepage experience.
- Prefer locally optimized responsive WebP files; eager-load the opening images and lazy-load the portfolio wall.
- Keep the HTML and canonical route structure stable. Any future WordPress build should reproduce the design around those URLs rather than changing them to fit a theme.

The implementation in this branch applies this direction to the homepage. Interior pages retain their current layout pending a separate, page-by-page design pass.
