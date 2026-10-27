(() => {
  'use strict';
  const KEY = 'office-ordem-demo-v1';
  const STATUS = { pendente: 'Pendente', andamento: 'Em andamento', concluida: 'Concluída' };
  const today = new Date().toLocaleDateString('sv-SE');
  const sample = [
    { id: 'ex-1', title: 'Revisão de equipamentos', owner: 'Equipe técnica', opened: today, status: 'andamento', description: 'Exemplo fictício: inspeção preventiva.' },
    { id: 'ex-2', title: 'Configuração de estações', owner: 'Suporte', opened: today, status: 'pendente', description: 'Exemplo fictício: preparar estações de trabalho.' },
    { id: 'ex-3', title: 'Atualização de sistema', owner: 'TI interno', opened: today, status: 'concluida', description: 'Exemplo fictício: aplicar atualização.' }
  ];
  const $ = (selector) => document.querySelector(selector);
  let storageAvailable = true;

  function sanitize(item) {
    if (!item || typeof item !== 'object') return null;
    if (!STATUS[item.status] || typeof item.title !== 'string' || typeof item.owner !== 'string' || typeof item.opened !== 'string') return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.opened)) return null;
    const title = item.title.trim().slice(0, 90);
    const owner = item.owner.trim().slice(0, 60);
    if (!title || !owner) return null;
    return {
      id: String(item.id || '').slice(0, 60) || newId(),
      title, owner, opened: item.opened, status: item.status,
      description: String(item.description || '').slice(0, 500)
    };
  }
  function newId() { return 'os-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return sample.map((order) => ({ ...order }));
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, 2000).map(sanitize).filter(Boolean) : sample.map((order) => ({ ...order }));
    } catch {
      storageAvailable = false;
      return sample.map((order) => ({ ...order }));
    }
  }
  let orders = load();

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('visible'), 3500);
  }
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(orders));
      storageAvailable = true;
    } catch {
      storageAvailable = false;
      toast('Armazenamento indisponível: alterações só duram até fechar a página.');
    }
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function render() {
    $('#stat-total').textContent = String(orders.length);
    $('#stat-progress').textContent = String(orders.filter((order) => order.status === 'andamento').length);
    $('#stat-complete').textContent = String(orders.filter((order) => order.status === 'concluida').length);
    $('#stat-pending').textContent = String(orders.filter((order) => order.status === 'pendente').length);

    const query = $('#search').value.trim().toLocaleLowerCase('pt-BR');
    const status = $('#filter').value;
    const filtered = orders.filter((order) => (status === 'todos' || order.status === status) &&
      (order.title.toLocaleLowerCase('pt-BR').includes(query) ||
       order.owner.toLocaleLowerCase('pt-BR').includes(query) ||
       order.description.toLocaleLowerCase('pt-BR').includes(query)));
    filtered.sort((a, b) => b.opened.localeCompare(a.opened) || b.id.localeCompare(a.id));
    const tbody = $('#order-rows');
    const fragment = document.createDocumentFragment();
    for (const order of filtered) {
      const row = document.createElement('tr');
      const service = document.createElement('td');
      service.append(node('strong', 'order-title', order.title), node('small', 'order-description', order.description || 'Sem observações'));
      const owner = node('td', '', order.owner);
      const opened = node('td', '', order.opened.split('-').reverse().join('/'));
      const statusCell = document.createElement('td');
      statusCell.append(node('span', 'status status-' + order.status, STATUS[order.status]));
      const actions = document.createElement('td');
      const controls = node('div', 'row-actions');
      const edit = node('button', '', 'Editar');
      edit.type = 'button'; edit.dataset.action = 'edit'; edit.dataset.id = order.id; edit.setAttribute('aria-label', 'Editar ' + order.title);
      const del = node('button', '', 'Excluir');
      del.type = 'button'; del.dataset.action = 'delete'; del.dataset.id = order.id; del.setAttribute('aria-label', 'Excluir ' + order.title);
      controls.append(edit, del);
      actions.append(controls);
      row.append(service, owner, opened, statusCell, actions);
      fragment.append(row);
    }
    tbody.replaceChildren(fragment);
    $('#empty').hidden = filtered.length > 0;
    $('#result-count').textContent = filtered.length + (filtered.length === 1 ? ' resultado' : ' resultados');
  }
  const dialog = $('#order-dialog');
  const form = $('#order-form');
  const titleElement = $('#form-title');
  function openForm(order) {
    form.reset();
    $('#order-id').value = order?.id || '';
    $('#title').value = order?.title || '';
    $('#owner').value = order?.owner || '';
    $('#opened').value = order?.opened || today;
    $('#status').value = order?.status || 'pendente';
    $('#description').value = order?.description || '';
    titleElement.textContent = order ? 'Editar ordem' : 'Nova ordem';
    dialog.showModal();
    $('#title').focus();
  }
  function closeForm() { dialog.close(); }
  $('#new-order').addEventListener('click', () => openForm(null));
  $('#close-dialog').addEventListener('click', closeForm);
  $('#cancel').addEventListener('click', closeForm);
  $('#search').addEventListener('input', render);
  $('#filter').addEventListener('change', render);
  $('#order-rows').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const index = orders.findIndex((order) => order.id === button.dataset.id);
    if (index < 0) return;
    const order = orders[index];
    if (button.dataset.action === 'edit') {
      openForm(order);
    } else if (button.dataset.action === 'delete' && window.confirm('Excluir a ordem "' + order.title + '"? Esta ação não pode ser desfeita.')) {
      orders.splice(index, 1);
      persist();
      render();
      toast('Ordem excluída.');
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const item = sanitize({
      id: $('#order-id').value || newId(),
      title: $('#title').value,
      owner: $('#owner').value,
      opened: $('#opened').value,
      status: $('#status').value,
      description: $('#description').value
    });
    if (!item) { toast('Confira os dados do formulário.'); return; }
    const index = orders.findIndex((order) => order.id === item.id);
    if (index >= 0) orders[index] = item;
    else orders.push(item);
    persist(); render(); closeForm(); toast('Ordem salva neste navegador.');
  });
  $('#export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ schema: 1, exportedAt: new Date().toISOString(), orders }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'office-ordem-demonstracao.json';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    toast('Arquivo JSON preparado.');
  });
  $('#reset').addEventListener('click', () => {
    if (!window.confirm('Substituir todas as ordens locais pelos três exemplos fictícios?')) return;
    orders = sample.map((order) => ({ ...order }));
    persist(); render(); toast('Exemplos restaurados.');
  });
  render();
  if (!storageAvailable) toast('Navegador bloqueou o armazenamento local. As alterações serão temporárias.');
})();
