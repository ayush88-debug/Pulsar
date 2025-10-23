/*
 * ============================================
 * CONTENTFUL LOADER (contentful-loader.js)
 * ============================================
 */

// **THIS IS THE FIX**
// We use $(window).on('load', ...) to ensure this code runs
// AFTER main.js has finished initializing the slider.
$(window).on('load', function() {
  // --- CONFIGURATION ---
  const SPACE_ID = 'swc2jzsn7ry0';
  const ACCESS_TOKEN = 'hTWRBirNkFztJfws-DjYFotCjAci-8-mPTRrbotUAQo';
  const LANDING_PAGE_ENTRY_ID = '13fSvipSkdVF81wq4p9SpZ';
  // ---------------------

  const contentfulEndpoint = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;

  const graphQLQuery = {
    query: `
      query GetLandingPage($landingPageId: String!) {
        landingPage(id: $landingPageId) {
          pageName
          header {
            logoLink
            lightLogo {
              url
              description
            }
            darkLogo {
              url
              description
            }
            navigationLinksCollection {
              items {
                text
                url
              }
            }
          }
          heroSlidesCollection {
            items {
              subtitle
              title
              description
              buttonText
              buttonLink
              backgroundImage {
                url
                description
              }
            }
          }
        }
      }
    `,
    variables: {
      landingPageId: LANDING_PAGE_ENTRY_ID,
    },
  };

  async function fetchContentfulData() {
    try {
      const response = await fetch(contentfulEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify(graphQLQuery),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pageData = data.data.landingPage;

      if (!pageData) {
        console.error('No page data found. Check your Entry ID.');
        return;
      }

      // 1. Render the Header
      renderHeader(pageData.header);

      // 2. Render the Hero Slider
      renderHeroSlider(pageData.heroSlidesCollection.items);
    } catch (error) {
      console.error('Error fetching data from Contentful:', error);
    }
  }

  function renderHeader(header) {
    if (!header) return;

    const logoLink = document.getElementById('header-logo');
    const logoLight = document.getElementById('logo-light');
    const logoDark = document.getElementById('logo-dark');

    if (logoLink) logoLink.href = header.logoLink || 'index.html';
    if (logoLight) {
      logoLight.src = header.lightLogo.url;
      logoLight.alt = header.lightLogo.description || 'logo';
    }
    if (logoDark) {
      logoDark.src = header.darkLogo.url;
      logoDark.alt = header.darkLogo.description || 'logo';
    }

    const navContainer = document.getElementById('nav-links-container');
    if (navContainer && header.navigationLinksCollection.items) {
      navContainer.innerHTML = '';
      header.navigationLinksCollection.items.forEach(link => {
        const li = document.createElement('li');
        li.className = 'nav__item';
        const a = document.createElement('a');
        a.className = 'nav__item-link';
        a.href = link.url;
        a.textContent = link.text;
        if (link.url === 'index.html' || link.url === '#') {
           a.classList.add('active');
        }
        li.appendChild(a);
        navContainer.appendChild(li);
      });
    }
  }

  /**
   * Populates the hero slider and initializes the Slick carousel
   * @param {Array} slides - The array of slide objects from Contentful
   */
  function renderHeroSlider(slides) {
    // This console log is for debugging. 
    // If the slider is still invisible, check the console!
    console.log('Slides data received:', slides); 

    if (!slides || slides.length === 0) {
      console.error('No slides found. Make sure they are published and linked to your Landing Page.');
      return;
    }

    const sliderContainer = document.getElementById('hero-slider-container');
    if (!sliderContainer) return;

    const $slider = $(sliderContainer);
    
    // Clear any static slides from the HTML
    sliderContainer.innerHTML = '';

    // Generate the HTML for each new slide
    slides.forEach(slide => {
      const slideHTML = `
        <div class="slide-item align-v-h">
          <div class="bg-img" style="background-image: url('${slide.backgroundImage.url}')"></div>
          <div class="container">
            <div class="row align-items-center">
              <div class="col-sm-12 col-md-12 col-lg-12 col-xl-7">
                <div class="slide__content">
                  <span class="slide__subtitle">${slide.subtitle}</span>
                  <h2 class="slide__title">${slide.title}</h2>
                  <p class="slide__desc">${slide.description}</p>
                  <div class="d-flex flex-wrap align-items-center">
                    <a href="${slide.buttonLink}" class="btn btn__secondary btn__rounded mr-30">
                      <span>${slide.buttonText}</span>
                      <i class="icon-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      sliderContainer.insertAdjacentHTML('beforeend', slideHTML);
    });

    // --- CRITICAL FIX ---
    // Now that the HTML is injected, we initialize Slick using the
    // options from the original index.html data-slick attribute.
    // The 'unslick' logic is GONE because main.js is no longer interfering.
    $slider.slick({
      slidesToShow: 1,
      arrows: true,
      dots: false,
      speed: 700,
      fade: true,
      cssEase: 'linear'
    });
  }
  // Run the fetch function
  fetchContentfulData();
}); // <-- Make sure this closing tag is correct!