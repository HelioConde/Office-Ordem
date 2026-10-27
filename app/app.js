// Office Ordem: edicao demonstrativa 100% local para GitHub Pages.
// Nenhuma informacao e enviada a um servidor.
const STORAGE_KEY = "office-ordem:orders:v1";
const STATUSES = ["Pendente", "Em andamento", "Concluída", "Cancelada"];
const byId = id => document.getElementById(id);
const currency = value => new Intl.NumberFormat("pt-BR", {style:"currency",currency:"BRL"}).format(value);
const day = value => new Date(value + "T12:00:00").toLocaleDateString("pt-BR");
const todayPlus = n => {const d = new Date();d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const sample = [
  {id:"demo-1",numero:"OS-0001",cliente:"Cliente Exemplo A",servico:"Revisão de computador",prazo:todayPlus(2),valor:180,status:"Em andamento",observacoes:"Registro fictício de demonstração."},
  {id:"demo-2",numero:"OS-0002",cliente:"Cliente Exemplo B",servico:"Instalação de software",prazo:todayPlus(6),valor:95,status:"Pendente",observacoes:"Registro fictício de demonstração."},
  {id:"demo-3",numero:"OS-0003",cliente:"Cliente Exemplo C",servico:"Manutenção preventiva",prazo:todayPlus(-2),valor:250,status:"Concluída",observacoes:"Registro fictício de demonstração."}
];
const plain = value => String(value ?? "").trim();
function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(plain(value))) return false;
  const [y,m,d] = value.split("-").map(Number);
  const t = new Date(Date.UTC(y,m-1,d));
  return t.getUTCFullYear()===y && t.getUTCMonth()+1===m && t.getUTCDate()===d && y>=2000 && y<=2100;
}
function validate(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Registro inválido.");
  const cliente=plain(item.cliente),servico=plain(item.servico),observacoes=plain(item.observacoes),status=plain(item.status),prazo=plain(item.prazo),numero=plain(item.numero),id=plain(item.id);
  const valor=Number(item.valor);
  if (!cliente || cliente.length>80 || !servico || servico.length>120) throw new Error("Cliente ou serviço inválido (limites de 80 e 120 caracteres).");
  if (!STATUSES.includes(status) || !isDate(prazo)) throw new Error("Prazo ou situação inválida.");
  if (!Number.isFinite(valor) || valor<0 || valor>99999999 || Math.round(valor*100)/100!==valor) throw new Error("Valor inválido.");
  if (!id || id.length>90 || !/^OS-\d{4,10}$/.test(numero) || observacoes.length>500) throw new Error("Identificador ou observações inválidas.");
  return {id,numero,cliente,servico,prazo,valor,status,observacoes};
}
let orders = [];
let editing = null;
let focusAfterDialog = null;
let toastTimer;
function announce(message) {
  const area=byId("toast");
  area.textContent=message;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{area.textContent="";},4300);
}
function save() {
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(orders));return true;}
  catch {announce("Armazenamento indisponível. Exporte um backup para não perder seus dados.");return false;}
}
function load() {
  try {
    const saved=localStorage.getItem(STORAGE_KEY);
    if (saved===null) {orders=sample.map(validate);save();return;}
    const parsed=JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length>500) throw new Error("Formato inválido");
    orders=parsed.map(validate);
  } catch {
    orders=sample.map(validate);
    announce("Não foi possível ler os dados locais. Confira ou restaure seu backup.");
  }
}
function node(tag,className,text) {
  const element=document.createElement(tag);
  if (className) element.className=className;
  if (text!==undefined) element.textContent=text;
  return element;
}
function searchable(text) {return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");}
function render() {
  byId("stat-total").textContent=orders.length;
  byId("stat-progress").textContent=orders.filter(x=>x.status==="Em andamento").length;
  byId("stat-done").textContent=orders.filter(x=>x.status==="Concluída").length;
  byId("stat-value").textContent=currency(orders.filter(x=>["Pendente","Em andamento"].includes(x.status)).reduce((sum,x)=>sum+x.valor,0));
  const search=searchable(byId("search").value.trim()),status=byId("status-filter").value;
  const visible=orders.filter(x=>(!status || x.status===status) && (!search || searchable([x.numero,x.cliente,x.servico,x.observacoes].join(" ")).includes(search)));
  byId("result-count").textContent=visible.length+" de "+orders.length+" registros";
  const body=byId("order-rows");
  body.replaceChildren();
  const labels=["Ordem","Cliente","Serviço","Prazo","Valor","Situação","Ações"];
  for (const item of visible) {
    const tr=node("tr");
    const cells=[
      node("span","order-id","#"+item.numero),
      node("span","client-name",item.cliente),
      node("span","service-text",item.servico),
      node("span","",day(item.prazo)),
      node("span","",currency(item.valor)),
      node("span","status-pill",item.status)
    ];
    cells[5].dataset.status=item.status;
    cells.forEach((child,i)=>{const td=node("td");td.dataset.label=labels[i];td.append(child);tr.append(td);});
    const actions=node("td");actions.dataset.label="Ações";
    const buttons=node("div","row-actions");
    const edit=node("button","","Editar");edit.type="button";edit.setAttribute("aria-label","Editar "+item.numero);
    edit.addEventListener("click",()=>openEditor(item));
    const remove=node("button","delete","Excluir");remove.type="button";remove.setAttribute("aria-label","Excluir "+item.numero);
    remove.addEventListener("click",()=>removeOrder(item));
    buttons.append(edit,remove);actions.append(buttons);tr.append(actions);body.append(tr);
  }
  byId("empty-state").hidden=visible.length!==0;
}
function openEditor(item) {
  editing=item?.id ?? null;
  const form=byId("order-form");
  form.reset();
  byId("form-error").hidden=true;
  byId("dialog-heading").textContent=item?"Editar "+item.numero:"Nova ordem";
  form.elements.cliente.value=item?.cliente || "";
  form.elements.servico.value=item?.servico || "";
  form.elements.prazo.value=item?.prazo || todayPlus(3);
  form.elements.valor.value=item?.valor ?? "";
  form.elements.status.value=item?.status || "Pendente";
  form.elements.observacoes.value=item?.observacoes || "";
  focusAfterDialog=document.activeElement;
  byId("order-dialog").showModal();
  form.elements.cliente.focus();
}
function nextCode() {
  const max=orders.reduce((n,x)=>Math.max(n,Number(x.numero.slice(3))||0),0);
  return "OS-"+String(max+1).padStart(4,"0");
}
function submitOrder(event) {
  event.preventDefault();
  const form=byId("order-form");
  const error=byId("form-error");
  error.hidden=true;
  if (!form.checkValidity()) {form.reportValidity();error.textContent="Preencha corretamente os campos obrigatórios.";error.hidden=false;return;}
  try {
    const old=orders.find(x=>x.id===editing);
    const entry=validate({
      id:old?.id || ("order-"+Date.now()+"-"+Math.random().toString(36).slice(2,9)),
      numero:old?.numero || nextCode(),
      cliente:form.elements.cliente.value,servico:form.elements.servico.value,
      prazo:form.elements.prazo.value,valor:Number(form.elements.valor.value),
      status:form.elements.status.value,observacoes:form.elements.observacoes.value
    });
    if (old) orders=orders.map(x=>x.id===old.id?entry:x);else orders.unshift(entry);
    save();render();byId("order-dialog").close();announce(old?"Ordem atualizada.":"Ordem cadastrada.");
  } catch (reason) {
    error.textContent=reason.message;
    error.hidden=false;
  }
}
function removeOrder(item) {
  if (!window.confirm("Excluir "+item.numero+" ("+item.cliente+")? Esta ação não pode ser desfeita.")) return;
  orders=orders.filter(x=>x.id!==item.id);save();render();announce("Ordem excluída.");
}
function download(name,mime,content) {
  const blob=new Blob([content],{type:mime});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function csvCell(value) {return '"'+String(value??"").replace(/"/g,'""')+'"';}
function exportCsv() {
  const headers=["Numero","Cliente","Servico","Prazo","Valor (BRL)","Situacao","Observacoes"];
  const csv=[headers,...orders.map(o=>[o.numero,o.cliente,o.servico,o.prazo,o.valor.toFixed(2),o.status,o.observacoes])]
    .map(row=>row.map(csvCell).join(";")).join("\r\n");
  download("office-ordem-"+todayPlus(0)+".csv","text/csv;charset=utf-8","\uFEFF"+csv);
  announce("CSV exportado.");
}
function exportJson() {
  download("office-ordem-backup-"+todayPlus(0)+".json","application/json;charset=utf-8",JSON.stringify({version:1,exportadoEm:new Date().toISOString(),orders},null,2));
  announce("Backup JSON exportado.");
}
async function importJson(event) {
  const file=event.target.files?.[0];if(!file)return;
  event.target.value="";
  try {
    if(file.size>1_000_000)throw new Error("O arquivo deve ter até 1 MB.");
    const data=JSON.parse(await file.text());
    const items=Array.isArray(data)?data:data?.orders;
    if(!Array.isArray(items) || items.length>500)throw new Error("Backup deve conter uma lista de até 500 ordens.");
    const parsed=items.map(validate);
    const ids=new Set(parsed.map(x=>x.id)),nums=new Set(parsed.map(x=>x.numero));
    if(ids.size!==parsed.length||nums.size!==parsed.length)throw new Error("Existem identificadores repetidos no backup.");
    if(!window.confirm("Importar "+parsed.length+" ordens e SUBSTITUIR os registros deste navegador? Exporte um backup antes de continuar."))return;
    orders=parsed;save();render();announce("Backup importado com sucesso.");
  }catch(reason){announce("Não foi possível importar: "+reason.message);}
}
byId("new-order").addEventListener("click",()=>openEditor());
byId("order-form").addEventListener("submit",submitOrder);
byId("close-dialog").addEventListener("click",()=>byId("order-dialog").close());
byId("cancel-dialog").addEventListener("click",()=>byId("order-dialog").close());
byId("order-dialog").addEventListener("close",()=>focusAfterDialog?.focus());
byId("search").addEventListener("input",render);
byId("status-filter").addEventListener("change",render);
byId("reset-filters").addEventListener("click",()=>{byId("search").value="";byId("status-filter").value="";render();byId("search").focus();});
byId("export-csv").addEventListener("click",exportCsv);
byId("export-json").addEventListener("click",exportJson);
byId("import-json").addEventListener("change",importJson);
load();
render();
