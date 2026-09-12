const sidebar = document.getElementById('sidebar');
const toggle = document.getElementById('sidebarToggle');
const overlay = document.getElementById('overlay');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  toggle.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', () => {
  const isOpen = sidebar.classList.contains('open');
  isOpen ? closeSidebar() : openSidebar();
});

overlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.submenu-arrow').forEach(button => {
    button.addEventListener('click', function() {
        const currentItem = this.closest('.has-submenu');
        const shouldOpen = !currentItem.classList.contains('open');

        document.querySelectorAll('.has-submenu').forEach(item => {
            item.classList.toggle('open', item === currentItem && shouldOpen);
        });
    });
});

document.querySelectorAll('.base-bar-field').forEach(field => {
  const bar = field.querySelector('.base-bar');
  const current = field.querySelector('input[id]:not([id$="-max"])');
  const maximum = field.querySelector('input[id$="-max"]');

  function updateBar() {
    const percentage = Math.max(0, Math.min(100, (Number(current.value) / Number(maximum.value)) * 100));
    bar.style.setProperty('--progress', `${percentage}%`);
  }

  current.addEventListener('input', updateBar);
  maximum.addEventListener('input', updateBar);
  updateBar();
});