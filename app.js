const STORAGE_KEY = 'looby-ideas';

const form = document.querySelector('#idea-form');
const titleInput = document.querySelector('#idea-title');
const descriptionInput = document.querySelector('#idea-description');
const ideasContainer = document.querySelector('#ideas');
const ideaTotal = document.querySelector('#idea-total');
const ideaDone = document.querySelector('#idea-done');
const template = document.querySelector('#idea-template');

const defaultIdeas = [
  {
    id: crypto.randomUUID(),
    title: 'Notifications push pour les rappels',
    description: 'Envoyer des alertes quand un projet ou une tâche approche de sa date limite.',
    implemented: false,
    createdAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Dossier de travail partagé',
    description: 'Permettre à plusieurs utilisateurs de collaborer sur un même espace de projet.',
    implemented: true,
    createdAt: Date.now() - 3600000,
  },
];

function readIdeas() {
  const savedIdeas = localStorage.getItem(STORAGE_KEY);

  if (!savedIdeas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultIdeas));
    return [...defaultIdeas];
  }

  try {
    const parsed = JSON.parse(savedIdeas);
    return Array.isArray(parsed) ? parsed : [...defaultIdeas];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultIdeas));
    return [...defaultIdeas];
  }
}

function saveIdeas(ideas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function updateStats(ideas) {
  const total = ideas.length;
  const done = ideas.filter((idea) => idea.implemented).length;

  ideaTotal.textContent = String(total);
  ideaDone.textContent = String(done);
}

function renderIdeas() {
  const ideas = readIdeas();
  ideasContainer.innerHTML = '';

  if (ideas.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Aucune idée pour le moment. Ajoutez la première fonctionnalité !';
    ideasContainer.appendChild(empty);
    updateStats(ideas);
    return;
  }

  ideas
    .slice()
    .sort((a, b) => Number(a.implemented) - Number(b.implemented))
    .forEach((idea) => {
      const clone = template.content.firstElementChild.cloneNode(true);
      const checkbox = clone.querySelector('.implemented-toggle');
      const title = clone.querySelector('.idea-title');
      const description = clone.querySelector('.idea-description');
      const badge = clone.querySelector('.idea-badge');
      const removeButton = clone.querySelector('.remove-button');

      title.textContent = idea.title;
      description.textContent = idea.description || 'Aucune description ajoutée.';
      checkbox.checked = idea.implemented;
      clone.classList.toggle('implemented', idea.implemented);
      badge.textContent = idea.implemented ? 'Implémentée' : 'À faire';

      checkbox.addEventListener('change', () => {
        const allIdeas = readIdeas();
        const updated = allIdeas.map((item) =>
          item.id === idea.id ? { ...item, implemented: checkbox.checked } : item,
        );
        saveIdeas(updated);
        renderIdeas();
      });

      removeButton.addEventListener('click', () => {
        const allIdeas = readIdeas().filter((item) => item.id !== idea.id);
        saveIdeas(allIdeas);
        renderIdeas();
      });

      ideasContainer.appendChild(clone);
    });

  updateStats(ideas);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    titleInput.focus();
    return;
  }

  const ideas = readIdeas();
  const newIdea = {
    id: crypto.randomUUID(),
    title,
    description,
    implemented: false,
    createdAt: Date.now(),
  };

  saveIdeas([newIdea, ...ideas]);
  form.reset();
  titleInput.focus();
  renderIdeas();
});

renderIdeas();
