import { addPrato, getAllPratos, deletePrato } from './db.js';

const btnAdd = document.getElementById('btn-add');
const formSection = document.getElementById('form-section');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const btnStartCamera = document.getElementById('btn-start-camera');
const btnTakePhoto = document.getElementById('btn-take-photo');
const preview = document.getElementById('preview');

const nomeInput = document.getElementById('nome');
const descInput = document.getElementById('descricao');
const precoInput = document.getElementById('preco');
const lista = document.getElementById('lista');

let stream = null;
let lastPhotoBase64 = null;

btnAdd.addEventListener('click', () => {
  formSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

btnCancel.addEventListener('click', () => {
  formSection.classList.add('hidden');
  stopCamera();
  resetForm();
});

btnStartCamera.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    btnTakePhoto.disabled = false;
    video.classList.remove('hidden');
  } catch (err) {
    alert('Não foi possível abrir a câmera: ' + err.message);
  }
});

btnTakePhoto.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  lastPhotoBase64 = dataUrl;
  preview.src = dataUrl;
  preview.classList.remove('hidden');
  video.classList.add('hidden');
  stopCamera();
});

btnSave.addEventListener('click', async () => {
  const nome = nomeInput.value.trim();
  const descricao = descInput.value.trim();
  const preco = precoInput.value.trim();

  if (!nome || !descricao || !preco || !lastPhotoBase64) {
    alert('Preencha todos os campos e capture uma foto.');
    return;
  }

  const prato = {
    nome,
    descricao,
    preco: parseFloat(preco),
    foto: lastPhotoBase64,
    createdAt: Date.now()
  };

  try {
    await addPrato(prato);
    alert('Prato salvo!');
    formSection.classList.add('hidden');
    resetForm();
    renderLista();
  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  }
});

function resetForm() {
  nomeInput.value = '';
  descInput.value = '';
  precoInput.value = '';
  preview.src = '';
  preview.classList.add('hidden');
  lastPhotoBase64 = null;
  if (video) {
    video.srcObject = null;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

async function renderLista() {
  lista.innerHTML = '';
  const pratos = await getAllPratos();
  if (!pratos || pratos.length === 0) {
    lista.innerHTML = '<p>Nenhum prato cadastrado.</p>';
    return;
  }

  pratos.sort((a,b) => b.createdAt - a.createdAt);

  for (const p of pratos) {
    const card = document.createElement('div');
    card.className = 'card-item';

    const img = document.createElement('img');
    img.src = p.foto;
    img.alt = p.nome;

    const title = document.createElement('div');
    title.className = 'item-row';
    title.innerHTML = `<span class="item-title">${p.nome}</span><strong>R$ ${p.preco.toFixed(2)}</strong>`;

    const desc = document.createElement('div');
    desc.className = 'item-desc';
    desc.textContent = p.descricao;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'space-between';
    actions.style.alignItems = 'center';

    const btnDel = document.createElement('button');
    btnDel.textContent = 'Excluir';
    btnDel.style.background = 'transparent';
    btnDel.style.border = '1px solid #eee';
    btnDel.style.borderRadius = '8px';
    btnDel.style.padding = '6px 10px';
    btnDel.style.cursor = 'pointer';

    btnDel.addEventListener('click', async () => {
      if (confirm('Excluir este prato?')) {
        await deletePrato(p.id);
        renderLista();
      }
    });

    actions.appendChild(btnDel);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(actions);
    lista.appendChild(card);
  }
}

// register service worker if supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('SW registrado');
    }).catch(err => console.error('SW falhou', err));
  });
}

renderLista();