const tabs = document.querySelectorAll('[role="tab"]');

function showPanel(selectedTab) {
	tabs.forEach(tab => {
		const isSelected = tab === selectedTab;
		const panel = document.getElementById(tab.getAttribute('aria-controls'));

		tab.setAttribute('aria-selected', String(isSelected));
		tab.tabIndex = isSelected ? 0 : -1;
		panel.hidden = !isSelected;
	});
}

tabs.forEach(tab => {
	tab.addEventListener('click', () => showPanel(tab));
});

const mariD2 = document.querySelector('.mariD2');
const rollD2 = document.getElementById('rollD2');

if (mariD2 && rollD2) {
	rollD2.addEventListener('click', () => {
		const result = Math.random() < 0.5 ? 1 : 2;
		const finalRotation = result === 1 ? 180 : 0;
		const currentRotation = Number(mariD2.dataset.rotation || 0);
		const nextRotation = currentRotation + 1080 + finalRotation - (currentRotation % 360);

		mariD2.dataset.rotation = nextRotation;
		mariD2.style.transform = `rotateX(-10deg) rotateY(${nextRotation}deg)`;
		mariD2.setAttribute('aria-label', `Resultado: ${result}`);
	});
}

const rollAuto = document.getElementById('rollAuto');
const diceSides = document.getElementById('diceSides');
const diceCount = document.getElementById('diceCount');
const rollDiceResults = document.getElementById('rollDiceResults');

if (rollAuto && diceSides && diceCount && rollDiceResults) {
	rollAuto.addEventListener('click', () => {
		const sides = Number.parseInt(diceSides.value, 10);
		const count = Number.parseInt(diceCount.value, 10);

		if (!Number.isInteger(sides) || sides < 1 || !Number.isInteger(count) || count < 1) {
			rollDiceResults.innerHTML = '';
			return;
		}

		const values = [];
		for (let index = 0; index < count; index++) {
			values.push(Math.floor(Math.random() * sides) + 1);
		}

		rollDiceResults.innerHTML = '';
		values.forEach((value, index) => {
			const mini = document.createElement('div');
			mini.className = 'mariposa-mini';
			mini.setAttribute('aria-label', `Resultado ${value}`);
			mini.style.animationDelay = `${index * 80}ms`;

			const number = document.createElement('h1');
			number.textContent = value;
			mini.appendChild(number);

			rollDiceResults.appendChild(mini);
		});
	});
}

// Funcionalidade de upload de imagem de retrato
const portraitContainer = document.getElementById('portrait-container');
const portraitImg = document.getElementById('portrait-img');
const portraitInput = document.getElementById('portrait-input');

if (portraitContainer && portraitImg && portraitInput) {
	// Abrir seletor de arquivo ao clicar na imagem
	portraitContainer.addEventListener('click', (e) => {
		portraitInput.click();
	});

	// Processar arquivo selecionado
	portraitInput.addEventListener('change', (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				portraitImg.src = event.target.result;
				// Armazenar a imagem no localStorage
				localStorage.setItem('portraitImage', event.target.result);
			};
			reader.readAsDataURL(file);
		}
	});

	// Carregar imagem armazenada ao abrir a página
	const storedImage = localStorage.getItem('portraitImage');
	if (storedImage) {
		portraitImg.src = storedImage;
	}
}

// Funcionalidade das barras de progresso (Vida, Sanidade, Absurdo)
function updateProgressBars() {
	const bars = [
		{ current: 'vida', max: 'vida-max' },
		{ current: 'sanidade', max: 'sanidade-max' },
		{ current: 'absurdo', max: 'absurdo-max' }
	];

	bars.forEach((bar, index) => {
		const currentInput = document.getElementById(bar.current);
		const maxInput = document.getElementById(bar.max);
		const barElement = document.querySelectorAll('.base-bar')[index];

		if (currentInput && maxInput && barElement) {
			function updateBar() {
				const current = parseFloat(currentInput.value) || 0;
				const max = parseFloat(maxInput.value) || 100;
				const percentage = Math.max(0, Math.min(100, (current / max) * 100));
				barElement.style.setProperty('--progress', `${percentage}%`);
			}

			updateBar();
			currentInput.addEventListener('input', updateBar);
			maxInput.addEventListener('input', updateBar);
		}
	});
}

updateProgressBars();

// scriptFicha.js — exporta/importa a ficha em JSON e guarda um rascunho no localStorage
(function () {
  const form = document.querySelector('main.ficha form');
  const btnExportar = document.getElementById('btnExportar');
  const btnImportar = document.getElementById('btnImportar');
  const inputImportar = document.getElementById('importFile');
  const portraitImg = document.getElementById('portrait-img');
  const CHAVE_LOCAL = 'unid-ficha'; // troque se um dia tiver mais de uma ficha no mesmo site

  if (!form) return;

  // ---------- Coleta / preenchimento (usado por export, import e localStorage) ----------
  function coletarDados() {
    const dados = {};
    form.querySelectorAll('[name]').forEach((campo) => {
      if (campo.type === 'number') {
        dados[campo.name] = campo.value === '' ? null : Number(campo.value);
      } else {
        dados[campo.name] = campo.value;
      }
    });

    if (portraitImg) {
      dados.portraitImage = portraitImg.src;
    }

    return dados;
  }

  function atualizarBarra(baseId) {
    const atual = form.elements[baseId];
    const max = form.elements[`${baseId}-max`];
    if (!atual || !max) return;
    const barra = atual.closest('.base-bar-field')?.querySelector('.base-bar');
    if (!barra) return;
    const pct = Math.max(0, Math.min(100, (Number(atual.value) / Number(max.value || 1)) * 100));
    barra.style.setProperty('--progress', pct + '%');
  }

  function preencherFormulario(dados) {
    Object.keys(dados).forEach((nome) => {
      if (nome === 'portraitImage') {
        if (portraitImg && typeof dados[nome] === 'string') {
          portraitImg.src = dados[nome];
        }
        return;
      }

      const campo = form.elements[nome];
      if (!campo) return; // ignora chaves do JSON que não existem nesta ficha
      campo.value = dados[nome] ?? '';
    });
    ['vida', 'sanidade', 'absurdo'].forEach(atualizarBarra);
  }

  function slugify(texto) {
    const limpo = (texto || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return limpo || 'ficha';
  }

  // ---------- localStorage (rascunho automático, fica salvo mesmo se fechar a aba) ----------
  function salvarLocal() {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(coletarDados()));
  }

  function carregarLocal() {
    const salvo = localStorage.getItem(CHAVE_LOCAL);
    if (!salvo) return;
    try {
      preencherFormulario(JSON.parse(salvo));
    } catch (erro) {
      console.warn('Rascunho salvo estava corrompido, ignorando.', erro);
    }
  }

  // ---------- Exportar (arquivo .json pra guardar/enviar) ----------
  function exportarFicha() {
    const dados = coletarDados();
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-${slugify(dados.nome)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- Importar (lê um .json e preenche a ficha) ----------
  function importarFicha(arquivo) {
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const dados = JSON.parse(leitor.result);
        preencherFormulario(dados);
        salvarLocal(); // o que foi importado também vira o rascunho local
      } catch (erro) {
        alert('Não consegui ler esse arquivo — confira se é um JSON exportado pela ficha.');
      }
    };
    leitor.readAsText(arquivo);
  }

  // ---------- Eventos ----------
  btnExportar?.addEventListener('click', (e) => {
    e.preventDefault();
    exportarFicha();
  });

  btnImportar?.addEventListener('click', (e) => {
    e.preventDefault();
    inputImportar?.click();
  });

  inputImportar?.addEventListener('change', (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) importarFicha(arquivo);
    e.target.value = ''; // permite selecionar o mesmo arquivo de novo depois
  });

  // qualquer digitação no formulário atualiza a barrinha (se for vida/sanidade/absurdo) e salva o rascunho
  form.addEventListener('input', (e) => {
    const nomeBase = e.target.name?.replace('-max', '');
    if (['vida', 'sanidade', 'absurdo'].includes(nomeBase)) atualizarBarra(nomeBase);
    salvarLocal();
  });

  // ao abrir a página, recupera o rascunho salvo (se existir)
  carregarLocal();
})();