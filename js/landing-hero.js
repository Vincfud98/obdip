export function renderAnimatedHeroSection({
  backgroundImageUrl,
  logoHtml,
  navLinks,
  topRightActionHtml = "",
  title,
  description,
  ctaButton = null,
  secondaryCta = null
}) {
  const hasActions = ctaButton || secondaryCta;

  return `
    <section class="landing-hero-block animate-fade-in">
      <div
        class="landing-hero-media"
        style="background-image: url('${backgroundImageUrl}')"
        aria-hidden="true"
      >
        <div class="landing-hero-overlay"></div>
      </div>

      <header class="landing-hero-header">
        <div class="landing-hero-logo">${logoHtml}</div>

        <nav class="landing-hero-nav" aria-label="Navegacao principal">
          ${navLinks
            .map(
              (link) => `
                <a href="${link.href}" class="landing-hero-nav-link">
                  ${link.label}
                </a>
              `
            )
            .join("")}
        </nav>

        <div class="landing-hero-top-action">${topRightActionHtml}</div>
      </header>

      <div class="landing-hero-content">
        <span class="landing-hero-kicker">Area oficial do participante</span>
        <h1 class="landing-hero-title">${title}</h1>
        <p class="landing-hero-description">${description}</p>

        ${hasActions ? `
          <div class="landing-hero-actions">
            ${ctaButton ? `
              <button class="btn btn-xl landing-glass-button" type="button" ${ctaButton.attributes || ""}>
                ${ctaButton.text}
              </button>
            ` : ""}
            ${secondaryCta ? `
              <button class="btn btn-xl landing-glass-button" type="button" ${secondaryCta.attributes || ""}>
                ${secondaryCta.text}
              </button>
            ` : ""}
          </div>
        ` : ""}
      </div>
    </section>
  `;
}
