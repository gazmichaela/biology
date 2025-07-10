
//----RESOURCE FUNCIONALITY----//

document.addEventListener('DOMContentLoaded', function() {
  const infoVariants = [
    'info-box', 'info-box-short', 'info-box-medium', 'info-box-medium-second', 
    'info-box-medium-third', 'info-box-left', 'info-box-long', 'info-box-short-second', 
    'info-box-short-third', 'info-box-short-fourth', 'info-box-long-left',
    'info-icon', 'info-icon-short', 'info-icon-medium', 'info-icon-medium-second', 
    'info-icon-medium-third', 'info-icon-left', 'info-icon-long', 'info-icon-short-second', 
    'info-icon-short-third', 'info-icon-short-fourth', 'info-icon-long-left',
    'info-icon-circle', 'info-icon-circle-short', 'info-icon-circle-medium', 
    'info-icon-circle-medium-second', 'info-icon-circle-medium-third', 'info-icon-circle-left', 
    'info-icon-circle-long', 'info-icon-circle-short-second', 'info-icon-circle-short-third', 
    'info-icon-circle-short-fourth', 'info-icon-circle-long-left'
  ];
  
  const selector = infoVariants.join(', .');
  
  const infoElements = document.querySelectorAll('.' + selector);
  
  const style = document.createElement('style');
  style.textContent = `
    .info-box, .info-box-short, .info-box-medium, .info-box-medium-second, 
    .info-box-medium-third, .info-box-left, .info-box-long, .info-box-short-second, 
    .info-box-short-third, .info-box-short-fourth, .info-box-long-left,
    .info-icon, .info-icon-short, .info-icon-medium, .info-icon-medium-second, 
    .info-icon-medium-third, .info-icon-left, .info-icon-long, .info-icon-short-second, 
    .info-icon-short-third, .info-icon-short-fourth, .info-icon-long-left,
    .info-icon-circle, .info-icon-circle-short, .info-icon-circle-medium, 
    .info-icon-circle-medium-second, .info-icon-circle-medium-third, .info-icon-circle-left, 
    .info-icon-circle-long, .info-icon-circle-short-second, .info-icon-circle-short-third, 
    .info-icon-circle-short-fourth, .info-icon-circle-long-left {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      cursor: pointer;
    }
    
    /* Zajištění, že odkazy v info-boxech budou vždy klikatelné */
    .info-box a, .info-box-short a, .info-box-medium a, .info-box-medium-second a, 
    .info-box-medium-third a, .info-box-left a, .info-box-long a, .info-box-short-second a, 
    .info-box-short-third a, .info-box-short-fourth a, .info-box-long-left a,
    .info-box [href], .info-box-short [href], .info-box-medium [href], .info-box-medium-second [href], 
    .info-box-medium-third [href], .info-box-left [href], .info-box-long [href], .info-box-short-second [href], 
    .info-box-short-third [href], .info-box-short-fourth [href], .info-box-long-left [href] {
      cursor: pointer !important;
      position: relative !important;
      z-index: 100 !important;
      pointer-events: auto !important;
    }
    
    /* Zdůrazněný kurzor pro odkazy při hoveru */
    .info-box.hover-active a:hover, .info-box-short.hover-active a:hover, 
    .info-box-medium.hover-active a:hover, .info-box-medium-second.hover-active a:hover,
    .info-box-medium-third.hover-active a:hover, .info-box-left.hover-active a:hover, 
    .info-box-long.hover-active a:hover, .info-box-short-second.hover-active a:hover,
    .info-box-short-third.hover-active a:hover, .info-box-short-fourth.hover-active a:hover, 
    .info-box-long-left.hover-active a:hover,
    .info-box.active a:hover, .info-box-short.active a:hover, .info-box-medium.active a:hover,
    .info-box-medium-second.active a:hover, .info-box-medium-third.active a:hover,
    .info-box-left.active a:hover, .info-box-long.active a:hover, 
    .info-box-short-second.active a:hover, .info-box-short-third.active a:hover, 
    .info-box-short-fourth.active a:hover, .info-box-long-left.active a:hover {
      text-decoration: underline !important;
    }
    
    /* Info-box ikony musí mít nižší z-index než odkazy */
    .info-icon, .info-icon-short, .info-icon-medium, .info-icon-medium-second, 
    .info-icon-medium-third, .info-icon-left, .info-icon-long, .info-icon-short-second, 
    .info-icon-short-third, .info-icon-short-fourth, .info-icon-long-left,
    .info-icon-circle, .info-icon-circle-short, .info-icon-circle-medium, 
    .info-icon-circle-medium-second, .info-icon-circle-medium-third, .info-icon-circle-left, 
    .info-icon-circle-long, .info-icon-circle-short-second, .info-icon-circle-short-third, 
    .info-icon-circle-short-fourth, .info-icon-circle-long-left {
      z-index: 90 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Funkce pro zjištění, zda element obsahuje třídu začínající specifickým prefixem
  function hasClassStartingWith(element, prefix) {
    return Array.from(element.classList).some(cls => cls.startsWith(prefix));
  }
  
  // Získáme všechny odkazy v info-boxech a přizpůsobíme je
  infoElements.forEach(function(infoElement) {
    // Najdeme všechny odkazy v každém info-boxu
    const links = infoElement.querySelectorAll('a, [href]');
    
    // Upravíme každý odkaz pro zajištění klikatelnosti
    links.forEach(function(link) {
      // Přidáme třídu pro lepší cílení v CSS
      link.classList.add('info-box-link');
      
      // Přidáme speciální event listener pro odkazy, který zastaví propagaci
      link.addEventListener('click', function(e) {
        e.stopPropagation(); // Zastaví propagaci události, aby se info-box nezavřel
      });
    });
    
    // Zjistíme, jestli je to box nebo ikona
    const isBox = hasClassStartingWith(infoElement, 'info-box');
    
    // Získání ikony (pokud se jedná o box, který by měl mít vnořenou ikonu)
    let icon = null;
    if (isBox) {
      // Hledáme ikonu uvnitř boxu 
      const iconSelectors = ['.info-icon', '.info-icon-circle'].map(s => 
        s + ', ' + infoVariants.filter(v => v.startsWith('info-icon')).map(v => '.' + v).join(', ')
      ).join(', ');
      
      icon = infoElement.querySelector(iconSelectors);
    }
    
    // Funkce pro zjištění, zda bylo kliknuto na ikonu
    function isClickOnIcon(event, element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      
      // Pro kruhy používáme vzdálenost od středu
      if (hasClassStartingWith(element, 'info-icon-circle')) {
        const clickX = event.clientX;
        const clickY = event.clientY;
        
        const distance = Math.sqrt(
          Math.pow(clickX - centerX, 2) + 
          Math.pow(clickY - centerY, 2)
        );
        
        const radius = Math.max(rect.width, rect.height) / 2;
        return distance <= radius;
      } 
      // Pro ostatní ikony používáme boundary check
      else {
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      }
    }
    
    // Click handler pro element
    infoElement.addEventListener('click', function(e) {
      // Kontrola, zda se kliklo na odkaz nebo jeho potomka
      let target = e.target;
      let isLink = false;
      
      // Kontrola jestli kliknutý element je odkaz nebo je vnořen v odkazu
      while (target && target !== this) {
        if (target.tagName === 'A' || target.hasAttribute('href') || target.classList.contains('info-box-link')) {
          isLink = true;
          break;
        }
        target = target.parentElement;
      }
      
      // Pokud je to odkaz, dovolíme mu provést výchozí akci (přesměrování)
      if (isLink) {
        e.stopPropagation(); // Zastavíme bubbling
        return; // Neděláme nic dalšího - necháme odkaz fungovat normálně
      }
      
      // Rozhodneme, zda bylo kliknuto na ikonu
      let clickedOnIcon = false;
      
      if (icon) {
        // Pokud máme ikonu v boxu, kontrolujeme klik na ikonu
        clickedOnIcon = isClickOnIcon(e, icon);
      } else if (!isBox) {
        // Pokud je element samostatná ikona, kontrolujeme klik na sebe sama
        clickedOnIcon = isClickOnIcon(e, this);
      } else {
        // Pokud je to box bez ikony, reaguje celý box
        clickedOnIcon = true;
      }
      
      // Pokud bylo kliknuto na ikonu
      if (clickedOnIcon) {
        // Pokud je již aktivní, zavřeme ho
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          this.classList.add('force-close');
          
          const handleMouseLeave = () => {
            this.classList.remove('force-close');
            this.removeEventListener('mouseleave', handleMouseLeave);
          };
          
          this.addEventListener('mouseleave', handleMouseLeave);
        } else {
          // Jinak ho otevřeme
          this.classList.add('active');
          this.classList.remove('force-close');
        }
      } else {
        // Pokud se kliklo na jinou část boxu než ikonu
        this.classList.toggle('active');
        this.classList.remove('force-close');
      }
      
      e.stopPropagation();
    });
    
    // Přidáme posluchače pro hover efekt pokud není force-close
    infoElement.addEventListener('mouseenter', function() {
      if (!this.classList.contains('force-close')) {
        this.classList.add('hover-active');
      }
    });
    
    infoElement.addEventListener('mouseleave', function() {
      this.classList.remove('hover-active');
    });
  });
  
  // Zavření info boxů/ikon při kliknutí kamkoliv jinam
  document.addEventListener('click', function(e) {
    // Kontrola, zda kliknutí bylo na odkaz uvnitř info-boxu
    let clickedOnInfoBoxLink = false;
    let target = e.target;
    
    // Kontrolujeme, zda je kliknutý element nebo jeho rodič odkaz v nějakém info-boxu
    while (target && target !== document) {
      if ((target.tagName === 'A' || target.hasAttribute('href') || target.classList.contains('info-box-link'))) {
        // Kontrolujeme, zda je tento odkaz uvnitř nějakého info-boxu
        for (let infoElement of infoElements) {
          if (infoElement.contains(target)) {
            clickedOnInfoBoxLink = true;
            break;
          }
        }
      }
      if (clickedOnInfoBoxLink) break;
      target = target.parentElement;
    }
    
    // Pokud se kliklo na odkaz v info-boxu, neděláme nic
    if (clickedOnInfoBoxLink) {
      return;
    }
    
    // Jinak zavřeme všechny info-boxy, které neobsahují kliknutý element
    infoElements.forEach(function(infoElement) {
      if (!infoElement.contains(e.target)) {
        infoElement.classList.remove('active');
        
        if (infoElement.matches(':hover')) {
          infoElement.classList.add('force-close');
          
          const handleMouseLeave = () => {
            infoElement.classList.remove('force-close');
            infoElement.removeEventListener('mouseleave', handleMouseLeave);
          };
          
          infoElement.addEventListener('mouseleave', handleMouseLeave);
        }
      }
    });
  });
  
  // Podpora pro mobilní zařízení - zavření při touchstart mimo element
  document.addEventListener('touchstart', function(e) {
    // Kontrola, zda se dotýká odkazu v info-boxu
    let touchedInfoBoxLink = false;
    let target = e.target;
    
    while (target && target !== document) {
      if ((target.tagName === 'A' || target.hasAttribute('href') || target.classList.contains('info-box-link'))) {
        for (let infoElement of infoElements) {
          if (infoElement.contains(target)) {
            touchedInfoBoxLink = true;
            break;
          }
        }
      }
      if (touchedInfoBoxLink) break;
      target = target.parentElement;
    }
    
    if (touchedInfoBoxLink) {
      return;
    }
    
    // Jinak zavřeme všechny info-boxy, které neobsahují dotčený element
    infoElements.forEach(function(infoElement) {
      if (!infoElement.contains(e.target)) {
        infoElement.classList.remove('active');
      }
    });
  });
});

