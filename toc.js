// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="devices.html"><strong aria-hidden="true">1.</strong> Devices</a></li><li class="chapter-item expanded "><a href="d2xx.html"><strong aria-hidden="true">2.</strong> D2xx protocol</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="fifo.html"><strong aria-hidden="true">2.1.</strong> FIFO modes</a></li><li class="chapter-item expanded "><a href="bitbang.html"><strong aria-hidden="true">2.2.</strong> Bitbang modes</a></li><li class="chapter-item expanded "><a href="mpsse.html"><strong aria-hidden="true">2.3.</strong> MPSSE mode</a></li><li class="chapter-item expanded "><a href="mcu-bus.html"><strong aria-hidden="true">2.4.</strong> MCU host bus mode</a></li><li class="chapter-item expanded "><a href="ft1248.html"><strong aria-hidden="true">2.5.</strong> FT1248 mode</a></li><li class="chapter-item expanded "><a href="opto.html"><strong aria-hidden="true">2.6.</strong> Fast opto-isolated serial mode</a></li><li class="chapter-item expanded "><a href="d2xx-i2cp.html"><strong aria-hidden="true">2.7.</strong> I2C peripherial mode</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">3.</strong> D2xx devices</div></li><li><ol class="section"><li class="chapter-item expanded "><a href="ft8u232a.html"><strong aria-hidden="true">3.1.</strong> FT8U232A and FT8U245A</a></li><li class="chapter-item expanded "><a href="ft232b.html"><strong aria-hidden="true">3.2.</strong> FT232B and FT245B</a></li><li class="chapter-item expanded "><a href="ft2232.html"><strong aria-hidden="true">3.3.</strong> FT2232[CDL]</a></li><li class="chapter-item expanded "><a href="ft232r.html"><strong aria-hidden="true">3.4.</strong> FT232R and FT245R</a></li><li class="chapter-item expanded "><a href="ft2232h.html"><strong aria-hidden="true">3.5.</strong> FT2232H and FT4232H</a></li><li class="chapter-item expanded "><a href="ft232h.html"><strong aria-hidden="true">3.6.</strong> FT232H</a></li><li class="chapter-item expanded "><a href="ft-x.html"><strong aria-hidden="true">3.7.</strong> FT-X series</a></li><li class="chapter-item expanded "><a href="ft4222h.html"><strong aria-hidden="true">3.8.</strong> FT4222H</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">4.</strong> D3xx protocol</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">5.</strong> FT260</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.</strong> MCU devices</div></li><li><ol class="section"><li class="chapter-item expanded "><div><strong aria-hidden="true">6.1.</strong> FT8U100A</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.2.</strong> FT51</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.3.</strong> FT32 architecture</div></li><li><ol class="section"><li class="chapter-item expanded "><div><strong aria-hidden="true">6.3.1.</strong> FT90x</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.3.2.</strong> FT93x</div></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.4.</strong> VNC1</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.5.</strong> VNC2</div></li><li><ol class="section"><li class="chapter-item expanded "><div><strong aria-hidden="true">6.5.1.</strong> FT311 and FT312</div></li></ol></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">7.</strong> FT313</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">8.</strong> EVE devices</div></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
