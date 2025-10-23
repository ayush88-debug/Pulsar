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
            featuresCollection {
                items {
                title
                description
                linkText
                linkUrl
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
      if (pageData.featuresCollection && pageData.featuresCollection.items) {
            renderFeaturesCarousel(pageData.featuresCollection.items);
        } else {
            console.warn("Features data missing from response.");
        }


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
    console.log('Slides data received:', slides); 

    if (!slides || slides.length === 0) {
      console.error('No slides found. Make sure they are published and linked to your Landing Page.');
      return;
    }

    const sliderContainer = document.getElementById('hero-slider-container');
    if (!sliderContainer) return;

    const $slider = $(sliderContainer);
    
    // 1. Clear any static slides from the HTML
    sliderContainer.innerHTML = '';

    // 2. Generate the HTML for each new slide
    slides.forEach(slide => {
      // --- THE TYPO WAS ON THE LINE BELOW ---
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

    // 3. Re-initialize Slick with the new dynamic content.
    $slider.slick({
      slidesToShow: 1,
      arrows: true,
      dots: false,
      speed: 700,
      fade: true,
      cssEase: 'linear'
    });
  }

  /**
   * Populates the features carousel and initializes it
   * @param {Array} features - The array of feature objects
   */
  function renderFeaturesCarousel(features) {
  console.log('Rendering features:', features);

  const container = document.getElementById('features-carousel-container');
  if (!container) {
    console.error("Features carousel container not found in HTML.");
    return;
  }

  const $container = $(container);
  container.innerHTML = '';

  features.forEach(feature => {
    const title = feature.title || 'Default Title';
    const description = feature.description || '';
    const linkUrl = feature.linkUrl || '#';
    const linkText = feature.linkText || 'Read More';

    const featureHTML = `
      <div class="feature-item d-flex">
        <div class="feature__content">
          <h4 class="feature__title">${title}</h4>
          ${description ? `<p class="feature__desc">${description}</p>` : ''}
          <a href="${linkUrl}" class="btn btn__link btn__secondary">
            <span>${linkText}</span>
            <i class="icon-arrow-right"></i>
          </a>
        </div>
      </div>`;
    container.insertAdjacentHTML('beforeend', featureHTML);
  });

    setTimeout(function() {
    if (!$container.hasClass('slick-initialized')) {
        $container.slick({
            // ... slick options ...
        });
        console.log("Features carousel initialized.");
    } else {
        $container.slick('refresh');
        console.warn("Features carousel was already initialized. Refreshing.");
    }
    }, 100);

    setTimeout(() => {
    $container.slick('setPosition');
    }, 500);
    }


  // Run the fetch function
  fetchContentfulData();
}); // <-- Make sure this closing tag is correct!