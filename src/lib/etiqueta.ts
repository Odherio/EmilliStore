import type { LojaConfig, Pedido } from '../types'
import { formatBRL } from './format'
import { lojaMapsUrl } from './maps'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function enderecoLinhas(pedido: Pedido, config: LojaConfig): string[] {
  if (pedido.tipoEntrega === 'retirada') {
    return [
      'Retirada na loja',
      config.enderecoLoja,
      `Localização: ${lojaMapsUrl(config)}`,
    ]
  }
  if (!pedido.endereco) return ['Entrega']
  const e = pedido.endereco
  const linhas = [
    `${e.rua}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ''}`,
    `${e.bairro} — ${e.cidade}/${e.uf}`,
    `CEP ${e.cep}`,
  ]
  if (e.referencia) linhas.push(`Ref.: ${e.referencia}`)
  return linhas
}

const LABEL_CSS = `
  .label {
    width: 92mm;
    min-height: 140mm;
    border: 2px solid #222;
    padding: 4mm;
    margin: 0 auto;
  }
  .brand {
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.04em;
    border-bottom: 2px solid #222;
    padding-bottom: 3mm;
    margin-bottom: 3mm;
  }
  .code {
    text-align: center;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.12em;
    margin: 2mm 0;
  }
  .badge {
    display: inline-block;
    border: 2px solid #222;
    padding: 1mm 3mm;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
  }
  .meta { text-align: center; margin-bottom: 3mm; color: #444; }
  .box {
    border-top: 1px dashed #222;
    padding-top: 2.5mm;
    margin-top: 2.5mm;
  }
  .box h2 {
    margin: 0 0 1.5mm;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
  }
  .name { font-size: 16px; font-weight: 700; }
  .phone { font-size: 13px; margin-top: 1mm; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1mm 0; vertical-align: top; }
  td.right { text-align: right; white-space: nowrap; }
  .var { color: #555; font-size: 11px; }
  .totais { margin-top: 2mm; font-size: 13px; }
  .totais .row { display: flex; justify-content: space-between; }
  .totais .total { font-size: 16px; font-weight: 800; margin-top: 1mm; }
  .obs { font-size: 11px; white-space: pre-wrap; }
  .foot {
    margin-top: 4mm;
    text-align: center;
    font-size: 10px;
    color: #666;
    border-top: 1px solid #222;
    padding-top: 2mm;
  }
`

function labelMarkup(pedido: Pedido, config: LojaConfig): string {
  const data = new Date(pedido.criadoEm).toLocaleString('pt-BR')
  const tipo = pedido.tipoEntrega === 'retirada' ? 'RETIRADA' : 'ENTREGA'
  const itens = pedido.itens
    .map(
      (i) =>
        `<tr>
          <td>${i.quantidade}x</td>
          <td>${escapeHtml(i.nome)} <span class="var">(${escapeHtml(i.variacao)})</span></td>
          <td class="right">${formatBRL(i.preco * i.quantidade)}</td>
        </tr>`,
    )
    .join('')
  const end = enderecoLinhas(pedido, config)
    .map((l) => {
      if (l.startsWith('Localização: ')) {
        const url = l.slice('Localização: '.length)
        return `<div><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>`
      }
      return `<div>${escapeHtml(l)}</div>`
    })
    .join('')

  return `<div class="label">
    <div class="brand">${escapeHtml(config.nome)}</div>
    <div class="code">${escapeHtml(pedido.codigo)}</div>
    <div class="meta">
      <span class="badge">${tipo}</span>
      <div style="margin-top:2mm">${escapeHtml(data)}</div>
    </div>
    <div class="box">
      <h2>Destinatário</h2>
      <div class="name">${escapeHtml(pedido.clienteNome)}</div>
      <div class="phone">WhatsApp: ${escapeHtml(pedido.clienteWhatsapp)}</div>
      ${pedido.clienteEmail ? `<div>${escapeHtml(pedido.clienteEmail)}</div>` : ''}
    </div>
    <div class="box">
      <h2>${pedido.tipoEntrega === 'retirada' ? 'Retirada na loja' : 'Endereço de entrega'}</h2>
      ${end}
      ${
        pedido.distanciaKm != null
          ? `<div style="margin-top:1mm">Distância: ${pedido.distanciaKm.toFixed(1)} km</div>`
          : ''
      }
    </div>
    <div class="box">
      <h2>Itens</h2>
      <table>${itens}</table>
      <div class="totais">
        <div class="row"><span>Subtotal</span><span>${formatBRL(pedido.subtotal)}</span></div>
        <div class="row"><span>Taxa entrega</span><span>${formatBRL(pedido.taxaEntrega)}</span></div>
        <div class="row total"><span>Total</span><span>${formatBRL(pedido.total)}</span></div>
      </div>
    </div>
    ${
      pedido.observacoes
        ? `<div class="box"><h2>Observações</h2><div class="obs">${escapeHtml(pedido.observacoes)}</div></div>`
        : ''
    }
    <div class="foot">Etiqueta gerada automaticamente · ${escapeHtml(config.nome)}</div>
  </div>`
}

function wrapPrintDocument(title: string, bodyInner: string, multiPage: boolean) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: 100mm 150mm; margin: 4mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #222;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    ${LABEL_CSS}
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .actions { text-align: center; margin: 12px 0 20px; }
    .actions button {
      font: inherit;
      padding: 10px 18px;
      margin: 0 6px;
      cursor: pointer;
      border: 1px solid #222;
      background: #111;
      color: #fff;
      border-radius: 999px;
    }
    @media print {
      body { background: #fff; }
      .noprint { display: none !important; }
      ${multiPage ? '' : ''}
    }
  </style>
</head>
<body>
  <div class="actions noprint">
    <button onclick="window.print()">Imprimir etiqueta</button>
    <button onclick="window.close()">Fechar</button>
  </div>
  ${bodyInner}
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 250);
    });
  </script>
</body>
</html>`
}

function openHtml(html: string, filename: string) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720')
  if (!win) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}

export function buildEtiquetaHtml(pedido: Pedido, config: LojaConfig): string {
  return wrapPrintDocument(
    `Etiqueta ${pedido.codigo}`,
    labelMarkup(pedido, config),
    false,
  )
}

/** Abre a etiqueta em nova aba e dispara a impressão. */
export function printEtiqueta(pedido: Pedido, config: LojaConfig) {
  openHtml(buildEtiquetaHtml(pedido, config), `etiqueta-${pedido.codigo}.html`)
}

/** Várias etiquetas na mesma janela (uma por página na impressão). */
export function printEtiquetas(pedidos: Pedido[], config: LojaConfig) {
  if (!pedidos.length) return
  if (pedidos.length === 1) {
    printEtiqueta(pedidos[0], config)
    return
  }
  const pages = pedidos
    .map((p) => `<div class="page">${labelMarkup(p, config)}</div>`)
    .join('')
  openHtml(
    wrapPrintDocument(`Etiquetas — ${config.nome}`, pages, true),
    `etiquetas-${pedidos.length}.html`,
  )
}
