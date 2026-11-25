function e(e){return!!e.form}var t=[`header`,`staticText`,`divider`];function n(e,t){return e==null?``:typeof e==`object`?e[t]||e.en||Object.values(e).find(e=>!!e)||``:String(e)}function r(e){let n={};for(let[r,i]of Object.entries(e.items||{}))i&&!t.includes(i.type)&&(n[r]=i.type);return n}function i(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?e.toString():JSON.stringify(e)}function a(e,t){if(t!=null)switch(e){case`number`:case`slider`:{if(typeof t==`number`)return Number.isFinite(t)?t:void 0;let e=i(t).trim().replace(`,`,`.`);if(!e)return;let n=Number(e);return Number.isFinite(n)?n:void 0}case`checkbox`:return t===!0||t===`true`||t===1||t===`1`;default:return i(t)}}function o(e,t){let n={};for(let[r,i]of Object.entries(e)){let e=a(i,t[r]);e!==void 0&&(n[r]=e)}return n}var s=`"Roboto", "Helvetica", "Arial", sans-serif`,c=Object.freeze({type:`light`,primary:`#3399CC`,primaryContrast:`#FFFFFF`,secondary:`#164477`,secondaryContrast:`#FFFFFF`,background:`#FFFFFF`,paper:`#FFFFFF`,text:`rgba(0, 0, 0, 0.87)`,textSecondary:`rgba(0, 0, 0, 0.6)`,divider:`rgba(0, 0, 0, 0.12)`,error:`#D32F2F`,warning:`#ED6C02`,info:`#0288D1`,success:`#2E7D32`,fontFamily:s,fontSize:14,borderRadius:4}),l=Object.freeze({type:`dark`,primary:`#4DABF5`,primaryContrast:`rgba(0, 0, 0, 0.87)`,secondary:`#436A93`,secondaryContrast:`#FFFFFF`,background:`#121212`,paper:`#121212`,text:`#FFFFFF`,textSecondary:`rgba(255, 255, 255, 0.7)`,divider:`rgba(255, 255, 255, 0.12)`,error:`#F44336`,warning:`#FFA726`,info:`#29B6F6`,success:`#66BB6A`,fontFamily:s,fontSize:14,borderRadius:4}),u=[`primary`,`primaryContrast`,`secondary`,`secondaryContrast`,`background`,`paper`,`text`,`textSecondary`,`divider`,`error`,`warning`,`info`,`success`,`fontFamily`],d=[`fontSize`,`borderRadius`];function f(e){return{...e===`dark`?l:c}}function p(e){if(!e||typeof e!=`object`)return f(typeof e==`string`?e:`light`);let t=e,n=f(typeof t.type==`string`?t.type:`light`);for(let e of u){let r=t[e];typeof r==`string`&&r.trim()&&(n[e]=r.trim())}for(let e of d){let r=t[e],i=typeof r==`string`?parseFloat(r):r;typeof i==`number`&&Number.isFinite(i)&&i>=0&&(n[e]=i)}return n}function m(e,t){return e.type===t.type&&u.every(n=>e[n]===t[n])&&d.every(n=>e[n]===t[n])}function h(e){return`--iob-${e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}`}function g(e){let t={};for(let n of u)t[h(n)]=e[n];for(let n of d)t[h(n)]=`${e[n]}px`;return t[`color-scheme`]=e.type,t}var _={ok:{en:`OK`,"zh-cn":`确定`},cancel:{en:`Cancel`,de:`Abbrechen`,ru:`Отмена`,pt:`Cancelar`,nl:`Annuleren`,fr:`Annuler`,it:`Annulla`,es:`Cancelar`,pl:`Anuluj`,uk:`Скасувати`,"zh-cn":`取消`},close:{en:`Close`,de:`Schließen`,ru:`Закрыть`,pt:`Fechar`,nl:`Sluiten`,fr:`Fermer`,it:`Chiudi`,es:`Cerrar`,pl:`Zamknij`,uk:`Закрити`,"zh-cn":`关闭`}},v=`
dialog {
    box-sizing: border-box;
    width: 480px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    padding: 0;
    border: 0;
    border-radius: calc(var(--iob-border-radius) * 2);
    background: var(--iob-paper);
    color: var(--iob-text);
    font-family: var(--iob-font-family);
    font-size: var(--iob-font-size);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
/* as the dialogs of MUI: a dark paper gets lighter the higher it lies */
dialog.dark { background-image: linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16)); }
dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
dialog:focus { outline: none; }
form { display: flex; flex-direction: column; height: 100%; max-height: inherit; margin: 0; }
header { display: flex; align-items: center; gap: 8px; padding: 12px 8px 12px 16px; font-size: 1.15em; font-weight: 500; }
header span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.body { flex: 1; min-height: 0; padding: 0 16px 16px; overflow: auto; display: flex; flex-direction: column; gap: 12px; }
footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 16px 16px; }
button { font: inherit; padding: 6px 16px; border-radius: var(--iob-border-radius); border: 1px solid var(--iob-primary); background: transparent; color: var(--iob-primary); cursor: pointer; }
button.primary { background: var(--iob-primary); color: var(--iob-primary-contrast); }
button.close { border: 0; padding: 2px 8px; font-size: 1.4em; line-height: 1; color: var(--iob-text-secondary); }
label { display: flex; flex-direction: column; gap: 4px; }
label.check { flex-direction: row; align-items: center; gap: 8px; }
input, select, textarea { font: inherit; accent-color: var(--iob-primary); }
.help { color: var(--iob-text-secondary); font-size: 0.85em; }
h3 { margin: 4px 0 0; font-size: 1em; }
p { margin: 0; }
hr { width: 100%; border: 0; border-top: 1px solid var(--iob-divider); margin: 0; }
[hidden] { display: none !important; }
`;function y(e){if(!e)return null;try{let t=Function(`data`,`return (${e});`);return e=>{try{return!!t(e)}catch{return!1}}}catch{return null}}function b(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function x(e){let{input:t,setting:n}=e;if(t)return t instanceof HTMLInputElement&&t.type===`checkbox`?t.checked:t instanceof HTMLSelectElement?n.options?.[t.selectedIndex]?.value:t.value}function S(e,t,r,i,a){let o={name:t,setting:r,box:e.createElement(`div`),hidden:y(r.hidden),disabled:y(r.disabled)},s=n(r.label,a);switch(r.type){case`header`:return o.box=e.createElement(`h3`),o.box.textContent=n(r.text,a)||s,o;case`staticText`:return o.box=e.createElement(`p`),o.box.textContent=n(r.text,a)||s,o;case`divider`:return o.box=e.createElement(`hr`),o}let c=e.createElement(`label`);o.box=c;let l=e.createElement(`span`);if(l.textContent=s||t,r.type===`checkbox`){let t=e.createElement(`input`);t.type=`checkbox`,t.checked=i===!0||i===`true`,c.className=`check`,c.append(t,l),o.input=t}else if(r.type===`select`){let t=e.createElement(`select`);for(let i of r.options||[]){let r=e.createElement(`option`);r.textContent=n(i.label,a),t.append(r)}let s=(r.options||[]).findIndex(e=>String(e.value)===b(i));t.selectedIndex=s===-1?0:s,c.append(l,t),o.input=t}else if(r.type===`text`&&(r.minRows||1)>1){let t=e.createElement(`textarea`);t.rows=r.minRows||2,t.value=b(i),c.append(l,t),o.input=t}else{let t=e.createElement(`input`),n=b(i);switch(r.type){case`number`:case`slider`:t.type=r.type===`slider`?`range`:`number`,r.min!==void 0&&(t.min=String(r.min)),r.max!==void 0&&(t.max=String(r.max)),t.step=r.step===void 0?`any`:String(r.step);break;case`password`:t.type=`password`;break;case`color`:t.type=!n||/^#[0-9a-f]{6}$/i.test(n)?`color`:`text`;break;default:t.type=`text`}if(t.value=n,t.type===`range`){let n=e.createElement(`output`);n.textContent=t.value,t.addEventListener(`input`,()=>n.textContent=t.value),l.append(`: `,n)}c.append(l,t),o.input=t}if(r.help){let t=e.createElement(`span`);t.className=`help`,t.textContent=n(r.help,a),c.append(t)}return o}function C(t,i={}){let a=i.lang||`en`,s=document,c=e=>_[e][a]||_[e].en||e,l=s.createElement(`div`);l.setAttribute(`data-iob-dialog`,``);let u=l.attachShadow({mode:`open`}),d=s.createElement(`style`);d.textContent=v;let f=s.createElement(`dialog`),m=p(i.theme);f.className=m.type===`dark`?`dark`:``;for(let[e,t]of Object.entries(g(m)))f.style.setProperty(e,t);t.width&&(f.style.width=`${t.width}px`),t.height&&(f.style.height=`${t.height}px`);let h=s.createElement(`form`),y=s.createElement(`header`),b=s.createElement(`span`);b.textContent=n(t.title,a);let C=s.createElement(`button`);C.type=`button`,C.className=`close`,C.title=c(`close`),C.setAttribute(`aria-label`,c(`close`)),C.textContent=`×`,y.append(b,C);let w=s.createElement(`div`);return w.className=`body`,h.append(y,w),f.append(h),u.append(d,f),new Promise(i=>{let d=!1,p=e=>{d||(d=!0,f.open&&f.close(),l.remove(),i(e))};if(C.addEventListener(`click`,()=>p(null)),f.addEventListener(`close`,()=>p(null)),h.addEventListener(`submit`,e=>e.preventDefault()),e(t)){let e={},i=[];for(let[e,n]of Object.entries(t.form.items||{})){let r=t.data?.[e]??n.default,o=S(s,e,n,r,a);i.push(o),w.append(o.box)}let l=()=>{for(let t of i)t.input&&(e[t.name]=x(t));return e},u=()=>{let e=l();for(let t of i)t.box.hidden=t.hidden?t.hidden(e):!1,t.input&&(t.input.disabled=t.disabled?t.disabled(e):!1)};h.addEventListener(`input`,u),h.addEventListener(`change`,u),u();let d=i.find(e=>e.input&&!e.box.hidden&&!e.input.disabled);d?.input&&(d.input.autofocus=!0);let f=s.createElement(`footer`),m=s.createElement(`button`);m.type=`button`,m.textContent=n(t.cancel,a)||c(`cancel`),m.addEventListener(`click`,()=>p(null));let g=s.createElement(`button`);g.type=`submit`,g.className=`primary`,g.textContent=n(t.ok,a)||c(`ok`),f.append(m,g),h.append(f),h.addEventListener(`submit`,()=>p(o(r(t.form),l())))}else w.append(t.element),f.addEventListener(`iob-dialog-close`,e=>p(e.detail??null));s.body.append(l),f.showModal(),u.activeElement&&u.activeElement!==C||(f.tabIndex=-1,f.focus())})}function w(e){return[...new Set(e.filter(e=>typeof e==`string`&&!!e))]}var T=[`socket`,`dialogs`,`theme`,`editMode`,`settings`,`value`],E=class extends HTMLElement{states={};objects={};#e=null;#t={};#n=p(`light`);#r=!1;#i=null;#a=void 0;#o=null;#s=!1;#c=(e,t)=>{this.#o?.states.includes(e)&&(this.states[e]=t||null,this.#_())};#l=(e,t)=>{this.#o?.objects.includes(e)&&(this.objects[e]=t||null,this.#d())};get socket(){return this.#e}set socket(e){this.#e=e||null,this.#d()}get settings(){return this.#t}set settings(e){this.#t=e||{},this.#d()}get theme(){return this.#n}set theme(e){let t=p(e);m(t,this.#n)||(this.#n=t,this.#u(),this.#_())}get editMode(){return this.#r}set editMode(e){let t=!!e;t!==this.#r&&(this.#r=t,this.#_())}get dialogs(){return this.#i}set dialogs(e){this.#i=e||null}get value(){return this.#a}set value(e){e!==this.#a&&(this.#a=e,this.#_())}connectedCallback(){for(let e of T)if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}this.#u(),this.#d()}disconnectedCallback(){this.#g()}getStateIds(e){return[]}getObjectIds(e){return[]}get systemLang(){return this.#e?.systemLang||`en`}text(e){return n(e,this.systemLang)}setState(e,t){return this.#e&&!this.#r?this.#e.setState(e,t):Promise.resolve()}changeValue(e){return this.#r||this.emit(`iob-change`,e)?!1:(this.value=e,!0)}emit(e,t){return this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0}))}async openDialog(t){if(this.#r)return null;let n=this.#i?await this.#i.open(t):await C(t,{lang:this.systemLang,theme:this.#n});return e(t)?n&&typeof n==`object`?o(r(t.form),n):null:n??null}#u(){for(let[e,t]of Object.entries(g(this.#n)))this.style.setProperty(e,t)}#d(){if(!this.isConnected)return;let e=this.#e,t=e?w(this.getStateIds(this.#t)):[],n=e?w(this.getObjectIds(this.#t)):[];this.#o&&this.#o.socket!==e&&this.#g();let r=this.#o?.states||[],i=this.#o?.objects||[],a=r.filter(e=>!t.includes(e)),o=i.filter(e=>!n.includes(e)),s=t.filter(e=>!r.includes(e)),c=n.filter(e=>!i.includes(e));e&&a.length&&e.unsubscribeState(a,this.#c),e&&o.length&&this.#h(e,o);for(let e of a)delete this.states[e];for(let e of[...a,...o])!t.includes(e)&&!n.includes(e)&&delete this.objects[e];this.#o=e&&(t.length||n.length)?{socket:e,states:t,objects:n}:null,e&&s.length&&this.#p(e,s),e&&c.length&&this.#m(e,c),this.#_()}#f(e,t,n){return this.#o?.socket===e&&this.#o[t].includes(n)}#p(e,t){e.subscribeState(t,this.#c).catch(e=>console.warn(`<${this.localName}>: cannot subscribe ${t.join(`, `)}: ${e}`));for(let n of t)e.getState(n).then(t=>{this.#f(e,`states`,n)&&this.states[n]===void 0&&(this.states[n]=t||null,this.#_())}).catch(()=>{}),e.getObject(n).then(t=>{this.#f(e,`states`,n)&&!this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#_())}).catch(()=>{})}#m(e,t){e.subscribeObject(t,this.#l).catch(e=>console.warn(`<${this.localName}>: cannot subscribe the objects ${t.join(`, `)}: ${e}`));for(let n of t)e.getObject(n).then(t=>{this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#d())}).catch(()=>{})}#h(e,t){e.unsubscribeObject(t,this.#l).catch(()=>{})}#g(){if(this.#o){let{socket:e,states:t,objects:n}=this.#o;t.length&&e.unsubscribeState(t,this.#c),n.length&&this.#h(e,n),this.#o=null}this.states={},this.objects={}}#_(){this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.isConnected&&this.render()}))}};function D(e,t){let n=typeof e==`string`?e:e.tag;customElements.get(n)||customElements.define(n,t)}var O=`iob-weather-insights`,k=/* @__PURE__ */ `pressure.seaLevel,pressure.change3h,pressure.tendency,pressure.tendencyText,pressure.zambrettiCode,pressure.zambrettiText,pressure.course,storm.level,storm.text,thunderstorm.level,thunderstorm.text,frost.level,frost.text,fog.level,fog.text,summary.level,summary.text,health.today.level,health.today.text,health.today.change6h,health.today.peakFrom,health.today.peakTo,health.tomorrow.level,health.tomorrow.text,health.tomorrow.change6h,health.tomorrow.peakFrom,health.tomorrow.peakTo,health.dayAfter.level,health.dayAfter.text,health.dayAfter.change6h,health.dayAfter.peakFrom,health.dayAfter.peakTo`.split(`,`),A={chooseInstance:`Choose an instance of weather-insights in the settings`,noData:`No data yet`,in3h:`in 3 h`,today:`Today`,tomorrow:`Tomorrow`,dayAfter:`Day after tomorrow`,sensitivity:`Weather sensitivity`,noWarnings:`No warnings`,storm:`Storm`,thunderstorm:`Thunderstorm`,frost:`Frost`,fog:`Fog`,measured:`measured`,forecast:`forecast`},j={en:A,de:{chooseInstance:`Instanz von weather-insights in den Einstellungen wählen`,noData:`Noch keine Daten`,in3h:`in 3 h`,today:`Heute`,tomorrow:`Morgen`,dayAfter:`Übermorgen`,sensitivity:`Wetterfühligkeit`,noWarnings:`Keine Warnungen`,storm:`Sturm`,thunderstorm:`Gewitter`,frost:`Frost`,fog:`Nebel`,measured:`gemessen`,forecast:`Vorhersage`},ru:{chooseInstance:`Выберите экземпляр weather-insights в настройках`,noData:`Данных пока нет`,in3h:`за 3 ч`,today:`Сегодня`,tomorrow:`Завтра`,dayAfter:`Послезавтра`,sensitivity:`Метеочувствительность`,noWarnings:`Нет предупреждений`,storm:`Шторм`,thunderstorm:`Гроза`,frost:`Мороз`,fog:`Туман`,measured:`измерено`,forecast:`прогноз`},pt:{chooseInstance:`Escolha uma instância de weather-insights nas definições`,noData:`Ainda sem dados`,in3h:`em 3 h`,today:`Hoje`,tomorrow:`Amanhã`,dayAfter:`Depois de amanhã`,sensitivity:`Sensibilidade ao tempo`,noWarnings:`Sem avisos`,storm:`Tempestade`,thunderstorm:`Trovoada`,frost:`Geada`,fog:`Nevoeiro`,measured:`medido`,forecast:`previsão`},nl:{chooseInstance:`Kies een instantie van weather-insights in de instellingen`,noData:`Nog geen gegevens`,in3h:`in 3 u`,today:`Vandaag`,tomorrow:`Morgen`,dayAfter:`Overmorgen`,sensitivity:`Weergevoeligheid`,noWarnings:`Geen waarschuwingen`,storm:`Storm`,thunderstorm:`Onweer`,frost:`Vorst`,fog:`Mist`,measured:`gemeten`,forecast:`voorspelling`},fr:{chooseInstance:`Choisissez une instance de weather-insights dans les paramètres`,noData:`Pas encore de données`,in3h:`en 3 h`,today:`Aujourd'hui`,tomorrow:`Demain`,dayAfter:`Après-demain`,sensitivity:`Sensibilité météo`,noWarnings:`Aucun avertissement`,storm:`Tempête`,thunderstorm:`Orage`,frost:`Gel`,fog:`Brouillard`,measured:`mesuré`,forecast:`prévision`},it:{chooseInstance:`Scegli un'istanza di weather-insights nelle impostazioni`,noData:`Ancora nessun dato`,in3h:`in 3 h`,today:`Oggi`,tomorrow:`Domani`,dayAfter:`Dopodomani`,sensitivity:`Meteoropatia`,noWarnings:`Nessun avviso`,storm:`Tempesta`,thunderstorm:`Temporale`,frost:`Gelo`,fog:`Nebbia`,measured:`misurato`,forecast:`previsione`},es:{chooseInstance:`Elija una instancia de weather-insights en la configuración`,noData:`Aún no hay datos`,in3h:`en 3 h`,today:`Hoy`,tomorrow:`Mañana`,dayAfter:`Pasado mañana`,sensitivity:`Sensibilidad al tiempo`,noWarnings:`Sin avisos`,storm:`Tormenta`,thunderstorm:`Tormenta eléctrica`,frost:`Helada`,fog:`Niebla`,measured:`medido`,forecast:`pronóstico`},pl:{chooseInstance:`Wybierz instancję weather-insights w ustawieniach`,noData:`Brak danych`,in3h:`w 3 h`,today:`Dziś`,tomorrow:`Jutro`,dayAfter:`Pojutrze`,sensitivity:`Meteopatia`,noWarnings:`Brak ostrzeżeń`,storm:`Sztorm`,thunderstorm:`Burza`,frost:`Przymrozek`,fog:`Mgła`,measured:`zmierzone`,forecast:`prognoza`},uk:{chooseInstance:`Виберіть екземпляр weather-insights у налаштуваннях`,noData:`Даних ще немає`,in3h:`за 3 год`,today:`Сьогодні`,tomorrow:`Завтра`,dayAfter:`Післязавтра`,sensitivity:`Метеочутливість`,noWarnings:`Немає попереджень`,storm:`Шторм`,thunderstorm:`Гроза`,frost:`Мороз`,fog:`Туман`,measured:`виміряно`,forecast:`прогноз`},"zh-cn":{chooseInstance:`请在设置中选择 weather-insights 实例`,noData:`暂无数据`,in3h:`3 小时内`,today:`今天`,tomorrow:`明天`,dayAfter:`后天`,sensitivity:`天气敏感`,noWarnings:`无警告`,storm:`风暴`,thunderstorm:`雷暴`,frost:`霜冻`,fog:`雾`,measured:`实测`,forecast:`预报`}};function M(e,t){return j[t]?.[e]||A[e]}var N=`
:host {
    display: block;
    width: 100%;
    height: 100%;
    container-type: size;
    --lvl0: var(--iob-success, #2e7d32);
    --lvl1: #c9a227;
    --lvl2: var(--iob-warning, #ed6c02);
    --lvl3: var(--iob-error, #d32f2f);
    --lvl4: #9c27b0;
}
.root {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 2.5cqmin;
    padding: 3cqmin;
    color: var(--iob-text);
    font-family: var(--iob-font-family, sans-serif);
    font-size: clamp(10px, 3.6cqmin, 18px);
    overflow: hidden;
}
.message {
    margin: auto;
    color: var(--iob-text-secondary);
    text-align: center;
}
.head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 3cqmin;
    row-gap: 0.5em;
}
.value {
    white-space: nowrap;
}
.big {
    font-size: 2.1em;
    font-weight: 600;
    line-height: 1;
}
.unit {
    margin-left: 0.25em;
    color: var(--iob-text-secondary);
}
.trend {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
}
.trend svg {
    width: 1.3em;
    height: 1.3em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}
.falling {
    color: var(--lvl3);
}
.rising {
    color: var(--iob-info, #0288d1);
}
.steady {
    color: var(--iob-text-secondary);
}
.zambretti {
    flex-basis: 100%;
    color: var(--iob-text-secondary);
}
.zambretti b {
    color: var(--iob-text);
    font-weight: 600;
}
.chart {
    flex: 1 1 0;
    min-height: 4em;
}
.chart svg {
    width: 100%;
    height: 100%;
    display: block;
}
.grid {
    stroke: var(--iob-divider, rgba(127, 127, 127, 0.25));
    stroke-width: 1;
}
.axis {
    fill: var(--iob-text-secondary);
    font-size: 11px;
}
.midnight {
    stroke: var(--iob-divider, rgba(127, 127, 127, 0.35));
    stroke-dasharray: 3 3;
}
.now {
    stroke: var(--iob-text-secondary);
    stroke-dasharray: 2 2;
}
.past {
    fill: none;
    stroke: var(--iob-primary, #1976d2);
    stroke-width: 2.5;
    stroke-linejoin: round;
}
.future {
    fill: none;
    stroke: var(--iob-primary, #1976d2);
    stroke-width: 2.5;
    stroke-dasharray: 6 4;
    stroke-linejoin: round;
    opacity: 0.75;
}
.band {
    opacity: 0.18;
}
.warnings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
}
.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    padding: 0.2em 0.6em;
    border-radius: 999px;
    border: 1px solid currentColor;
    font-size: 0.9em;
}
.none {
    color: var(--iob-text-secondary);
}
.health-title {
    color: var(--iob-text-secondary);
    font-size: 0.85em;
}
.health {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7em, 1fr));
    gap: 0.5em;
}
.day {
    border: 1px solid var(--iob-divider, rgba(127, 127, 127, 0.3));
    border-radius: calc(var(--iob-border-radius, 4px) * 2);
    padding: 0.45em 0.6em;
    min-width: 0;
}
.day-name {
    color: var(--iob-text-secondary);
    font-size: 0.85em;
}
.level {
    display: flex;
    align-items: center;
    gap: 0.35em;
    font-weight: 600;
}
.dot {
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
    background: currentColor;
    flex: none;
}
.detail {
    font-size: 0.85em;
    color: var(--iob-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
}
.l0 { color: var(--lvl0); }
.l1 { color: var(--lvl1); }
.l2 { color: var(--lvl2); }
.l3 { color: var(--lvl3); }
.l4 { color: var(--lvl4); }
.band.l0 { fill: var(--lvl0); }
.band.l1 { fill: var(--lvl1); }
.band.l2 { fill: var(--lvl2); }
.band.l3 { fill: var(--lvl3); }
.band.l4 { fill: var(--lvl4); }
@container (max-height: 260px) {
    .health-title { display: none; }
}
`,P=`system.adapter.`,F=36e5;function I(e){let t=(e||``).trim();return t.startsWith(P)?t.slice(15):t}function L(e){return e.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`)}function R(e){if(e==null||e===``)return null;let t=typeof e==`number`?e:parseFloat(String(e));return Number.isFinite(t)?t:null}function z(e){try{let t=JSON.parse(String(e||`[]`));return Array.isArray(t)?t.filter(e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1])):[]}catch{return[]}}function B(){let e=Math.floor(Date.now()/F)*F,t=[];for(let n=-24;n<=48;n++){let r=1016-6*Math.sin((n+10)/12)+(n>20?(n-20)*.35:0);t.push([e+n*F,Math.round(r*10)/10,+(n>0)])}return{"pressure.seaLevel":t[24][1],"pressure.change3h":-1.8,"pressure.tendency":-2,"pressure.tendencyText":`falling`,"pressure.zambrettiCode":`P`,"pressure.zambrettiText":`Changeable, some rain`,"pressure.course":JSON.stringify(t),"storm.level":1,"storm.text":`Gale possible`,"health.today.level":1,"health.today.text":`Moderate: pressure falling 3.2 hPa, 14:00-20:00`,"health.today.peakFrom":e+2*F,"health.today.peakTo":e+8*F,"health.tomorrow.level":3,"health.tomorrow.text":`Strong: pressure rising 6.4 hPa, 06:00-12:00`,"health.tomorrow.peakFrom":e+26*F,"health.tomorrow.peakTo":e+32*F,"health.dayAfter.level":0,"health.dayAfter.text":`Low: pressure rising 1.1 hPa, 03:00-09:00`}}var V=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;D(O,class extends E{#e;constructor(){super(),this.#e=this.attachShadow({mode:`open`})}getStateIds(e){let t=I(e.instance);return t?k.map(e=>`${t}.${e}`):[]}#t(e,t,n=!1){let r=this.systemLang===`zh-cn`?`zh-CN`:this.systemLang;try{return e.toLocaleString(r,{minimumFractionDigits:t,maximumFractionDigits:t,signDisplay:n?`exceptZero`:`auto`,useGrouping:!1})}catch{return(n&&e>0?`+`:``)+e.toFixed(t)}}#n(e){let t=this.systemLang,n=R(e[`pressure.seaLevel`]);if(n===null)return`<div class="head"><span class="none">${L(M(`noData`,t))}</span></div>`;let r=`<div class="head"><div class="value"><span class="big">${this.#t(n,1)}</span><span class="unit">hPa</span></div>`,i=R(e[`pressure.tendency`]),a=R(e[`pressure.change3h`]);if(i!==null){let n=i<=-2?`falling`:i>=2?`rising`:`steady`,o=String(e[`pressure.tendencyText`]??``),s=a===null?``:` · ${this.#t(a,1,!0)} hPa ${M(`in3h`,t)}`;r+=`<div class="trend ${n}"><span style="display:inline-flex;transform:rotate(${-i*20}deg)">${V}</span><span>${L(o+s)}</span></div>`}let o=e[`pressure.zambrettiText`];if(o){let t=e[`pressure.zambrettiCode`]?`${String(e[`pressure.zambrettiCode`])} · `:``;r+=`<div class="zambretti">Zambretti: <b>${L(t+String(o))}</b></div>`}return`${r}</div>`}#r(e){let t=z(e[`pressure.course`]);if(t.length<2)return``;let n=t[0][0],r=t[t.length-1][0],i=Math.min(...t.map(e=>e[1])),a=Math.max(...t.map(e=>e[1]));if(a-i<8){let e=(a+i)/2;i=e-4,a=e+4}i=Math.floor(i-1),a=Math.ceil(a+1);let o=e=>34+(e-n)/Math.max(1,r-n)*520,s=e=>8+(a-e)/(a-i)*124,c=`<svg viewBox="0 0 560 150" preserveAspectRatio="xMidYMid meet" role="img">`;for(let t of[`today`,`tomorrow`,`dayAfter`]){let i=R(e[`health.${t}.level`]),a=R(e[`health.${t}.peakFrom`]),s=R(e[`health.${t}.peakTo`]);if(i&&a!==null&&s!==null&&s>n&&a<r){let e=o(Math.max(a,n)),t=o(Math.min(s,r));c+=`<rect class="band l${i}" x="${e.toFixed(1)}" y="8" width="${Math.max(1,t-e).toFixed(1)}" height="124"/>`}}let l=a-i>24?10:5;for(let e=Math.ceil(i/l)*l;e<=a;e+=l){let t=s(e).toFixed(1);c+=`<line class="grid" x1="34" x2="554" y1="${t}" y2="${t}"/>`,c+=`<text class="axis" x="30" y="${t}" text-anchor="end" dominant-baseline="middle">${e}</text>`}let u=new Date(n);u.setHours(24,0,0,0);let d=[`tomorrow`,`dayAfter`],f=u.getTime()-Date.now()>0?0:-1;for(let e=new Date(u);e.getTime()<r;e.setDate(e.getDate()+1)){let t=e.getTime(),n=o(t).toFixed(1);c+=`<line class="midnight" x1="${n}" x2="${n}" y1="8" y2="132"/>`;let r=f<0?M(`today`,this.systemLang):d[f]?M(d[f],this.systemLang):``;r&&o(t)<514&&(c+=`<text class="axis" x="${(o(t)+4).toFixed(1)}" y="18">${L(r)}</text>`),f++}let p=new Date(n);p.setMinutes(0,0,0),p.setHours(Math.ceil(p.getHours()/12)*12);for(let e=p;e.getTime()<=r;e.setHours(e.getHours()+12)){let t=e.getTime();t>=n&&(c+=`<text class="axis" x="${o(t).toFixed(1)}" y="146" text-anchor="middle">${String(e.getHours()).padStart(2,`0`)}</text>`)}let m=t.reduce((e,t,n)=>t[2]===0?n:e,-1),h=Date.now(),g=m>=0?m:t.findIndex(e=>e[0]>h)-1;g<0&&(g=t.length-1);let _=e=>e.map((e,t)=>`${t?`L`:`M`}${o(e[0]).toFixed(1)} ${s(e[1]).toFixed(1)}`).join(``);if(c+=`<path class="past" d="${_(t.slice(0,g+1))}"/>`,g<t.length-1&&(c+=`<path class="future" d="${_(t.slice(g))}"/>`),h>n&&h<r){let e=o(h).toFixed(1);c+=`<line class="now" x1="${e}" x2="${e}" y1="8" y2="132"/>`}return`<div class="chart">${c}</svg></div>`}#i(e){let t=this.systemLang,n=[];for(let[r,i,a]of[[`storm.level`,`storm.text`,`storm`],[`thunderstorm.level`,`thunderstorm.text`,`thunderstorm`],[`frost.level`,`frost.text`,`frost`],[`fog.level`,`fog.text`,`fog`]]){let o=R(e[r]);if(o&&(a!==`fog`||o>=2)){let r=String(e[i]||M(a,t));n.push(`<span class="chip l${Math.min(4,o+1)}"><span class="dot"></span>${L(r)}</span>`)}}return n.length||n.push(`<span class="none">${L(M(`noWarnings`,t))}</span>`),`<div class="warnings">${n.join(``)}</div>`}#a(e){let t=this.systemLang,n=[[`today`,`today`],[`tomorrow`,`tomorrow`],[`dayAfter`,`dayAfter`]].map(([n,r])=>{let i=R(e[`health.${n}.level`]);if(i===null)return``;let a=String(e[`health.${n}.text`]||``),o=a.indexOf(`: `),s=o>0?a.slice(0,o):String(i),c=o>0?a.slice(o+2):a;return`<div class="day"><div class="day-name">${L(M(r,t))}</div><div class="level l${i}"><span class="dot"></span>${L(s)}</div><div class="detail" title="${L(c)}">${L(c)}</div></div>`}).join(``);return n?`<div class="health-title">${L(M(`sensitivity`,t))}</div><div class="health">${n}</div>`:``}#o(){let e=this.settings,t=I(e.instance),n;if(t){n={};for(let e of k)n[e]=this.states[`${t}.${e}`]?.val}else{if(!this.editMode)return`<div class="message">${L(M(`chooseInstance`,this.systemLang))}</div>`;n=B()}let r=``;return e.showPressure!==!1&&(r+=this.#n(n)),e.showChart!==!1&&(r+=this.#r(n)),e.showWarnings!==!1&&(r+=this.#i(n)),e.showHealth!==!1&&(r+=this.#a(n)),r}render(){this.#e.innerHTML=`<style>${N}</style><div class="root">${this.#o()}</div>`}});