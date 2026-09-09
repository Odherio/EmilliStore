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
      config.enderecoLoja || 'Endereço da loja não configurado',
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
    width: 100%;
    max-width: 92mm;
    min-height: 120mm;
    border: 2px solid #000;
    padding: 4mm;
    margin: 0 auto;
    background: #fff;
    color: #000;
  }
  .brand {
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.04em;
    border-bottom: 2px solid #000;
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
    border: 2px solid #000;
    padding: 1mm 3mm;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
  }
  .meta { text-align: center; margin-bottom: 3mm; color: #222; }
  .box {
    border-top: 1px dashed #000;
    padding-top: 2.5mm;
    margin-top: 2.5mm;
  }
  .box h2 {
    margin: 0 0 1.5mm;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #333;
  }
  .name { font-size: 16px; font-weight: 700; }
  .phone { font-size: 13px; margin-top: 1mm; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1mm 0; vertical-align: top; }
  td.right { text-align: right; white-space: nowrap; }
  .var { color: #333; font-size: 11px; }
  .totais { margin-top: 2mm; font-size: 13px; }
  .totais .row { display: flex; justify-content: space-between; }
  .totais .total { font-size: 16px; font-weight: 800; margin-top: 1mm; }
  .obs { font-size: 11px; white-space: pre-wrap; }
  .foot {
    margin-top: 4mm;
    text-align: center;
    font-size: 10px;
    color: #333;
    border-top: 1px solid #000;
    padding-top: 2mm;
  }
`

function labelMarkup(pedido: Pedido, config: LojaConfig): string {
  const criado = pedido.criadoEm ? new Date(pedido.criadoEm) : new Date()
  const data = Number.isNaN(criado.getTime())
    ? new Date().toLocaleString('pt-BR')
    : criado.toLocaleString('pt-BR')
  const tipo = pedido.tipoEntrega === 'retirada' ? 'RETIRADA' : 'ENTREGA'
  const itens = (pedido.itens ?? [])
    .map(
      (i) =>
        `<tr>
          <td>${i.quantidade}x</td>
          <td>${escapeHtml(i.nome || '')} <span class="var">(${escapeHtml(i.variacao || '')}${i.cor ? ` · ${escapeHtml(i.cor)}` : ''})</span></td>
          <td class="right">${formatBRL(Number(i.preco) * Number(i.quantidade))}</td>
        </tr>`,
    )
    .join('')
  const end = enderecoLinhas(pedido, config)
    .map((l) => {
      if (l.startsWith('Localização: ')) {
        const url = l.slice('Localização: '.length)
        return `<div style="word-break:break-all"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>`
      }
      return `<div>${escapeHtml(l)}</div>`
    })
    .join('')

  return `<div class="label">
    <div class="brand">${escapeHtml(config.nome || 'EmilliStore')}</div>
    <div class="code">${escapeHtml(pedido.codigo || 'SEM-CODIGO')}</div>
    <div class="meta">
      <span class="badge">${tipo}</span>
      <div style="margin-top:2mm">${escapeHtml(data)}</div>
    </div>
    <div class="box">
      <h2>Destinatário</h2>
      <div class="name">${escapeHtml(pedido.clienteNome || '')}</div>
      <div class="phone">WhatsApp: ${escapeHtml(pedido.clienteWhatsapp || '')}</div>
      ${pedido.clienteEmail ? `<div>${escapeHtml(pedido.clienteEmail)}</div>` : ''}
    </div>
    <div class="box">
      <h2>${pedido.tipoEntrega === 'retirada' ? 'Retirada na loja' : 'Endereço de entrega'}</h2>
      ${end}
      ${
        pedido.distanciaKm != null
          ? `<div style="margin-top:1mm">Distância: ${Number(pedido.distanciaKm).toFixed(1)} km</div>`
          : ''
      }
    </div>
    <div class="box">
      <h2>Itens</h2>
      <table>${itens || '<tr><td>Sem itens</td></tr>'}</table>
      <div class="totais">
        <div class="row"><span>Subtotal</span><span>${formatBRL(Number(pedido.subtotal) || 0)}</span></div>
        <div class="row"><span>Taxa entrega</span><span>${formatBRL(Number(pedido.taxaEntrega) || 0)}</span></div>
        <div class="row total"><span>Total</span><span>${formatBRL(Number(pedido.total) || 0)}</span></div>
      </div>
    </div>
    ${
      pedido.observacoes
        ? `<div class="box"><h2>Observações</h2><div class="obs">${escapeHtml(pedido.observacoes)}</div></div>`
        : ''
    }
    <div class="foot">Etiqueta gerada automaticamente · ${escapeHtml(config.nome || 'EmilliStore')}</div>
  </div>`
}

function wrapPrintDocument(title: string, bodyInner: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 8mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    ${LABEL_CSS}
    .page {
      page-break-after: always;
      break-after: page;
      padding: 8px 0;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .actions {
      text-align: center;
      margin: 12px 0 16px;
    }
    .actions button {
      font: inherit;
      padding: 10px 18px;
      margin: 0 6px;
      cursor: pointer;
      border: 1px solid #000;
      background: #111;
      color: #fff;
      border-radius: 999px;
    }
    @media print {
      html, body { background: #fff !important; }
      .noprint { display: none !important; }
      .actions { display: none !important; }
      .label { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="actions noprint">
    <button type="button" id="btn-print">Imprimir etiqueta</button>
    <button type="button" id="btn-close">Fechar</button>
  </div>
  ${bodyInner}
  <script>
    (function () {
      function goPrint() {
        try { window.focus(); window.print(); } catch (e) {}
      }
      var btn = document.getElementById('btn-print');
      var closeBtn = document.getElementById('btn-close');
      if (btn) btn.addEventListener('click', goPrint);
      if (closeBtn) closeBtn.addEventListener('click', function () { window.close(); });
      // Espera o documento pintar antes de abrir o diálogo
      if (document.readyState === 'complete') {
        setTimeout(goPrint, 400);
      } else {
        window.addEventListener('load', function () { setTimeout(goPrint, 400); });
      }
    })();
  </script>
</body>
</html>`
}

function openHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  // Blob URL evita about:blank + document.write (causa comum de impressão vazia)
  const win = window.open(url, '_blank')
  if (!win) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    alert('Permita pop-ups para imprimir a etiqueta, ou abra o arquivo baixado.')
    return
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function buildEtiquetaHtml(pedido: Pedido, config: LojaConfig): string {
  return wrapPrintDocument(
    `Etiqueta ${pedido.codigo}`,
    labelMarkup(pedido, config),
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
    wrapPrintDocument(`Etiquetas — ${config.nome}`, pages),
    `etiquetas-${pedidos.length}.html`,
  )
}
