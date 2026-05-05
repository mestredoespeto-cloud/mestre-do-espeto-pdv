import React, { useEffect, useState } from 'react'

const cardapio = {
  Espetos: [
    { nome: 'Carne Bovina', preco: 10 },
    { nome: 'Costela', preco: 10 },
    { nome: 'Coração de Frango', preco: 10 },
    { nome: 'Frango', preco: 10 },
    { nome: 'Kafta', preco: 10 },
    { nome: 'Linguiça Pernil', preco: 10 },
    { nome: 'Lombo', preco: 10 },
    { nome: 'Panceta', preco: 10 },
    { nome: 'Pão de Alho', preco: 10 },
    { nome: 'Queijo Coalho', preco: 10 },
    { nome: 'Tulipa', preco: 10 }
  ],

  'Espetos Premium Avulso': [
    { nome: 'Medalhão de Frango', preco: 12 },
    { nome: 'Linguiça Cuiabana', preco: 12 },
    { nome: 'Misto Especial', preco: 12 }
  ],

  Executivos: [
    { nome: 'Executivo Mestre Clássico 1', preco: 29.99, qtdEspetos: 2 },
    { nome: 'Executivo Mestre Clássico 2', preco: 39.99, qtdEspetos: 3 }
  ],

  Adicionais: [
    { nome: 'Porção de Arroz 500g', preco: 10 },
    { nome: 'Porção de Vinagrete 350g', preco: 8 },
    { nome: 'Medalhão de Frango no Executivo', preco: 10, premiumExecutivo: true, estoqueNome: 'Medalhão de Frango' },
    { nome: 'Linguiça Cuiabana no Executivo', preco: 10, premiumExecutivo: true, estoqueNome: 'Linguiça Cuiabana' },
    { nome: 'Misto Especial no Executivo', preco: 10, premiumExecutivo: true, estoqueNome: 'Misto Especial' }
  ],

  Bebidas: [
    { nome: 'Água sem Gás', preco: 3 },
    { nome: 'Água com Gás', preco: 3 },
    { nome: 'Coca-Cola Lata', preco: 6 },
    { nome: 'Coca-Cola Zero Lata', preco: 6 },
    { nome: 'Fanta Laranja Lata', preco: 6 },
    { nome: 'Fanta Uva Lata', preco: 6 },
    { nome: 'Suco Del Valle Laranja 450ml', preco: 6 },
    { nome: 'Suco Del Valle Uva 450ml', preco: 6 },
    { nome: 'Suco Kapo Laranja', preco: 5 },
    { nome: 'Suco Kapo Maracujá', preco: 5 },
    { nome: 'Suco Kapo Morango', preco: 5 },
    { nome: 'Suco Kapo Uva', preco: 5 },
    { nome: 'Brahma Lata 350ml', preco: 5 },
    { nome: 'Skol Lata 350ml', preco: 5 },
    { nome: 'Original Lata 350ml', preco: 8 },
    { nome: 'Heineken Long Neck 330ml', preco: 12 },
    { nome: 'Heineken Long Neck Zero 330ml', preco: 12 },
    { nome: 'Energético Monster 473ml', preco: 12 }
  ]
}

const estoqueInicial = {}
Object.values(cardapio).flat().forEach(item => {
  const nomeEstoque = item.estoqueNome || item.nome
  estoqueInicial[nomeEstoque] = 50
})

const hoje = () => new Date().toISOString().slice(0, 10)

export default function App() {
  const [loading, setLoading] = useState(true)
  const [comandas, setComandas] = useState([])
  const [historico, setHistorico] = useState([])
  const [comandaAtual, setComandaAtual] = useState(null)
  const [cliente, setCliente] = useState('')
  const [atendente, setAtendente] = useState('')
  const [pagamento, setPagamento] = useState('dinheiro')
  const [estoque, setEstoque] = useState(estoqueInicial)
  const [busca, setBusca] = useState('')
  const [dataRelatorio, setDataRelatorio] = useState(hoje())
  const [executivoSelecionado, setExecutivoSelecionado] = useState(null)
  const [espetosExecutivo, setEspetosExecutivo] = useState([])

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200)
  }, [])

  useEffect(() => {
    const salvo = localStorage.getItem('pdv_mestre_do_espeto')
    if (salvo) {
      const dados = JSON.parse(salvo)
      setComandas(dados.comandas || [])
      setHistorico(dados.historico || [])
      setEstoque({ ...estoqueInicial, ...(dados.estoque || {}) })
      setAtendente(dados.atendente || '')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pdv_mestre_do_espeto', JSON.stringify({
      comandas,
      historico,
      estoque,
      atendente
    }))
  }, [comandas, historico, estoque, atendente])

  const tocarSom = (arquivo) => {
    try { new Audio(arquivo).play() } catch (e) {}
  }

  const atualizarComanda = (nova) => {
    setComandaAtual(nova)
    setComandas(comandas.map(c => c.id === nova.id ? nova : c))
  }

  const criarComanda = () => {
    if (!atendente.trim()) return alert('Digite o nome do atendente.')
    if (!cliente.trim()) return alert('Digite nome, mesa ou referência.')

    const nova = {
      id: Date.now(),
      cliente,
      atendente,
      itens: [],
      abertaEm: new Date().toISOString()
    }

    tocarSom('/nova-comanda.mp3')
    setComandas([...comandas, nova])
    setComandaAtual(nova)
    setCliente('')
  }

  const adicionarItem = (item, categoria) => {
    if (!comandaAtual) return alert('Selecione ou crie uma comanda.')

    const nomeEstoque = item.estoqueNome || item.nome

    if ((estoque[nomeEstoque] || 0) <= 0) {
      tocarSom('/alerta.mp3')
      return alert(`${nomeEstoque} está sem estoque.`)
    }

    const novoEstoque = {
      ...estoque,
      [nomeEstoque]: (estoque[nomeEstoque] || 0) - 1
    }

    if (novoEstoque[nomeEstoque] <= 5) tocarSom('/alerta.mp3')

    const itemVenda = {
      nome: item.nome,
      preco: item.preco,
      categoria,
      tipo: item.premiumExecutivo ? 'premium-executivo' : 'normal',
      estoqueNome: nomeEstoque
    }

    atualizarComanda({
      ...comandaAtual,
      itens: [...comandaAtual.itens, itemVenda]
    })

    setEstoque(novoEstoque)
  }

  const abrirSelecaoExecutivo = (item) => {
    if (!comandaAtual) return alert('Selecione ou crie uma comanda.')
    setExecutivoSelecionado(item)
    setEspetosExecutivo([])
  }

  const alternarEspetoExecutivo = (espeto) => {
    const existe = espetosExecutivo.includes(espeto.nome)

    if (existe) {
      setEspetosExecutivo(espetosExecutivo.filter(e => e !== espeto.nome))
      return
    }

    if (espetosExecutivo.length >= executivoSelecionado.qtdEspetos) {
      return alert(`Esse prato permite escolher ${executivoSelecionado.qtdEspetos} espetos.`)
    }

    if ((estoque[espeto.nome] || 0) <= 0) {
      tocarSom('/alerta.mp3')
      return alert(`${espeto.nome} está sem estoque.`)
    }

    setEspetosExecutivo([...espetosExecutivo, espeto.nome])
  }

  const confirmarExecutivo = () => {
    if (!executivoSelecionado) return

    if (espetosExecutivo.length !== executivoSelecionado.qtdEspetos) {
      return alert(`Selecione exatamente ${executivoSelecionado.qtdEspetos} espetos.`)
    }

    let novoEstoque = { ...estoque }

    for (const espeto of espetosExecutivo) {
      if ((novoEstoque[espeto] || 0) <= 0) {
        tocarSom('/alerta.mp3')
        return alert(`${espeto} está sem estoque.`)
      }
      novoEstoque[espeto] -= 1
    }

    const itemVenda = {
      nome: executivoSelecionado.nome,
      preco: executivoSelecionado.preco,
      categoria: 'Executivos',
      tipo: 'executivo',
      espetosInclusos: [...espetosExecutivo]
    }

    atualizarComanda({
      ...comandaAtual,
      itens: [...comandaAtual.itens, itemVenda]
    })

    setEstoque(novoEstoque)
    setExecutivoSelecionado(null)
    setEspetosExecutivo([])
  }

  const removerItem = (index) => {
    const item = comandaAtual.itens[index]
    const novosItens = [...comandaAtual.itens]
    novosItens.splice(index, 1)

    let novoEstoque = { ...estoque }

    if (item.tipo === 'executivo') {
      item.espetosInclusos.forEach(e => {
        novoEstoque[e] = (novoEstoque[e] || 0) + 1
      })
    } else {
      const nomeEstoque = item.estoqueNome || item.nome
      novoEstoque[nomeEstoque] = (novoEstoque[nomeEstoque] || 0) + 1
    }

    setEstoque(novoEstoque)
    atualizarComanda({ ...comandaAtual, itens: novosItens })
  }

  const total = comandaAtual
    ? comandaAtual.itens.reduce((acc, i) => acc + i.preco, 0)
    : 0

  const imprimirTexto = (texto) => {
    tocarSom('/impressao.mp3')
    const win = window.open('', '', 'width=340,height=650')
    win.document.write(`<pre style="font-family:monospace;font-size:14px;">${texto}</pre>`)
    win.document.write('<button onclick="window.print()">IMPRIMIR</button>')
    win.print()
  }

  const descricaoItem = (item) => {
    if (item.tipo === 'executivo') {
      return `${item.nome} - R$ ${item.preco.toFixed(2)}\n  Espetos inclusos: ${item.espetosInclusos.join(', ')}`
    }
    return `${item.nome} - R$ ${item.preco.toFixed(2)}`
  }

  const imprimirCozinha = () => {
    if (!comandaAtual) return

    const texto = `
PEDIDO COZINHA
MESTRE DO ESPETO

Cliente/Mesa: ${comandaAtual.cliente}
Atendente: ${comandaAtual.atendente}
------------------------
${comandaAtual.itens.map(i => {
  if (i.tipo === 'executivo') {
    return `${i.nome}\n  Espetos: ${i.espetosInclusos.join(', ')}`
  }
  return i.nome
}).join('\n')}
------------------------
PREPARAR PEDIDO
`
    imprimirTexto(texto)
  }

  const imprimirCliente = () => {
    if (!comandaAtual) return

    const texto = `
MESTRE DO ESPETO
Cliente/Mesa: ${comandaAtual.cliente}
Atendente: ${comandaAtual.atendente}
------------------------
${comandaAtual.itens.map(descricaoItem).join('\n')}
------------------------
TOTAL: R$ ${total.toFixed(2)}
Pagamento: ${pagamento.toUpperCase()}

Obrigado e volte sempre!
`
    imprimirTexto(texto)
  }

  const fecharComanda = () => {
    if (!comandaAtual) return
    if (comandaAtual.itens.length === 0) return alert('Comanda sem itens.')

    const dataFechamento = new Date().toISOString().slice(0, 10)

    setHistorico([
      ...historico,
      {
        ...comandaAtual,
        pagamento,
        total,
        dataFechamento,
        fechadoEm: new Date().toISOString()
      }
    ])

    setComandas(comandas.filter(c => c.id !== comandaAtual.id))
    setComandaAtual(null)
  }

  const relatorioPorData = (data) => {
    const filtrado = historico.filter(c => c.dataFechamento === data)

    const categorias = {}
    const produtos = {}
    const caixaData = { dinheiro: 0, pix: 0, cartao: 0 }
    let totalVendas = 0
    let totalItens = 0

    filtrado.forEach(c => {
      totalVendas += c.total || 0
      caixaData[c.pagamento] = (caixaData[c.pagamento] || 0) + (c.total || 0)

      c.itens.forEach(item => {
        totalItens++

        produtos[item.nome] = produtos[item.nome] || { qtd: 0, total: 0 }
        produtos[item.nome].qtd += 1
        produtos[item.nome].total += item.preco

        categorias[item.categoria] = categorias[item.categoria] || {
          qtd: 0,
          total: 0,
          produtos: {}
        }

        categorias[item.categoria].qtd += 1
        categorias[item.categoria].total += item.preco

        categorias[item.categoria].produtos[item.nome] =
          categorias[item.categoria].produtos[item.nome] || { qtd: 0, total: 0 }

        categorias[item.categoria].produtos[item.nome].qtd += 1
        categorias[item.categoria].produtos[item.nome].total += item.preco
      })
    })

    const lista = Object.entries(produtos)

    return {
      comandas: filtrado,
      categorias,
      produtos,
      caixaData,
      totalVendas,
      totalItens,
      maisSaiu: lista.length ? lista.reduce((a, b) => a[1].qtd > b[1].qtd ? a : b) : null,
      menosSaiu: lista.length ? lista.reduce((a, b) => a[1].qtd < b[1].qtd ? a : b) : null
    }
  }

  const rel = relatorioPorData(dataRelatorio)
  const totalCaixaData = rel.caixaData.dinheiro + rel.caixaData.pix + rel.caixaData.cartao

  const imprimirRelatorioData = () => {
    const texto = `
FECHAMENTO DO DIA ${dataRelatorio}
MESTRE DO ESPETO

Comandas fechadas: ${rel.comandas.length}
Itens vendidos: ${rel.totalItens}

------------------------
RESUMO POR CATEGORIA

${Object.keys(rel.categorias).map(cat => {
  const c = rel.categorias[cat]
  return `${cat.toUpperCase()} - R$ ${c.total.toFixed(2)} | ${c.qtd} un.\n${Object.keys(c.produtos).map(p => {
    const prod = c.produtos[p]
    return `  - ${p}: ${prod.qtd} un. | R$ ${prod.total.toFixed(2)}`
  }).join('\n')}`
}).join('\n\n')}

------------------------
CAIXA DO DIA

Dinheiro: R$ ${rel.caixaData.dinheiro.toFixed(2)}
Pix: R$ ${rel.caixaData.pix.toFixed(2)}
Cartão: R$ ${rel.caixaData.cartao.toFixed(2)}

Valor esperado: R$ ${rel.totalVendas.toFixed(2)}
Valor registrado: R$ ${totalCaixaData.toFixed(2)}
Diferença: R$ ${(totalCaixaData - rel.totalVendas).toFixed(2)}

Produto que mais saiu:
${rel.maisSaiu ? `${rel.maisSaiu[0]} - ${rel.maisSaiu[1].qtd} un.` : 'Sem vendas'}

Produto que menos saiu:
${rel.menosSaiu ? `${rel.menosSaiu[0]} - ${rel.menosSaiu[1].qtd} un.` : 'Sem vendas'}
`
    imprimirTexto(texto)
  }

  const exportarBackup = () => {
    const dados = localStorage.getItem('pdv_mestre_do_espeto')
    if (!dados) return alert('Nenhum dado encontrado.')

    const blob = new Blob([dados], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-mestre-do-espeto-${hoje()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const limparDiaSelecionado = () => {
    if (!confirm(`Deseja limpar o histórico do dia ${dataRelatorio}?`)) return
    setHistorico(historico.filter(c => c.dataFechamento !== dataRelatorio))
  }

  const reporEstoque = (produto) => {
    const qtd = Number(prompt(`Quantidade para repor ${produto}:`))
    if (!qtd || qtd <= 0) return
    setEstoque({ ...estoque, [produto]: (estoque[produto] || 0) + qtd })
  }

  const comandasFiltradas = comandas.filter(c =>
    c.cliente.toLowerCase().includes(busca.toLowerCase())
  )

  const opcoesEspetos = cardapio.Espetos

  if (loading) {
    return (
      <div style={styles.splash}>
        <img src="/logo.png" alt="Mestre do Espeto" style={styles.logoSplash} />
        <h1>MESTRE DO ESPETO</h1>
        <p>Carregando sistema...</p>
      </div>
    )
  }

  return (
    <div style={styles.app}>
      <div style={styles.logoBox}>
        <img src="/logo.png" alt="Mestre do Espeto" style={styles.logo} />
        <h1 style={styles.title}>MESTRE DO ESPETO — PDV</h1>
      </div>

      <div style={styles.card}>
        <h2>Atendente</h2>
        <input placeholder="Nome do atendente" value={atendente} onChange={e => setAtendente(e.target.value)} style={styles.input} />
      </div>

      <div style={styles.card}>
        <h2>Nova Comanda</h2>
        <input placeholder="Nome / Mesa / Referência" value={cliente} onChange={e => setCliente(e.target.value)} style={styles.input} />
        <button onClick={criarComanda} style={styles.green}>➕ Criar Comanda</button>
      </div>

      <div style={styles.card}>
        <h2>Comandas Abertas</h2>
        <input placeholder="Buscar comanda..." value={busca} onChange={e => setBusca(e.target.value)} style={styles.input} />
        {comandasFiltradas.map(c => (
          <button key={c.id} onClick={() => setComandaAtual(c)} style={styles.smallBtn}>
            {c.cliente} — {c.itens.length} itens
          </button>
        ))}
      </div>

      {executivoSelecionado && (
        <div style={styles.cardDestaque}>
          <h2>{executivoSelecionado.nome}</h2>
          <p>Selecione {executivoSelecionado.qtdEspetos} espetos tradicionais inclusos.</p>
          <p>Selecionados: {espetosExecutivo.join(', ') || 'nenhum'}</p>

          {opcoesEspetos.map(e => (
            <button
              key={e.nome}
              onClick={() => alternarEspetoExecutivo(e)}
              style={espetosExecutivo.includes(e.nome) ? styles.selectedBtn : styles.itemBtn}
            >
              {e.nome} | Estoque: {estoque[e.nome] || 0}
            </button>
          ))}

          <button onClick={confirmarExecutivo} style={styles.green}>✅ Confirmar Executivo</button>
          <button onClick={() => setExecutivoSelecionado(null)} style={styles.red}>Cancelar</button>
        </div>
      )}

      {comandaAtual && (
        <div style={styles.card}>
          <h2>Comanda: {comandaAtual.cliente}</h2>

          {Object.keys(cardapio).map(cat => (
            <div key={cat}>
              <h3>{cat}</h3>

              <div style={styles.grid}>
                {cardapio[cat].map(item => (
                  <button
                    key={item.nome}
                    onClick={() => cat === 'Executivos' ? abrirSelecaoExecutivo(item) : adicionarItem(item, cat)}
                    style={cat === 'Executivos' ? styles.execBtn : styles.itemBtn}
                  >
                    <strong>{item.nome}</strong>
                    <br />
                    R$ {item.preco.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <h2>Itens</h2>
          {comandaAtual.itens.map((item, index) => (
            <div key={index} style={styles.itemLinha}>
              <span>
                {item.nome} — R$ {item.preco.toFixed(2)}
                {item.tipo === 'executivo' && <small><br />Espetos inclusos: {item.espetosInclusos.join(', ')}</small>}
              </span>
              <button onClick={() => removerItem(index)}>❌</button>
            </div>
          ))}

          <h2>Total: R$ {total.toFixed(2)}</h2>

          <select value={pagamento} onChange={e => setPagamento(e.target.value)} style={styles.input}>
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">Pix</option>
            <option value="cartao">Cartão</option>
          </select>

          <button onClick={imprimirCozinha} style={styles.yellow}>👨‍🍳 Imprimir Pedido Cozinha</button>
          <button onClick={imprimirCliente} style={styles.green}>🖨️ Imprimir Comanda Cliente</button>
          <button onClick={fecharComanda} style={styles.red}>💰 Fechar Comanda</button>
        </div>
      )}

      <div style={styles.card}>
        <h2>Backup</h2>
        <button onClick={exportarBackup} style={styles.green}>💾 Baixar Backup</button>
      </div>

      <div style={styles.card}>
        <h2>Relatório por Data</h2>
        <input type="date" value={dataRelatorio} onChange={e => setDataRelatorio(e.target.value)} style={styles.input} />
        <button onClick={imprimirRelatorioData} style={styles.green}>🧾 Imprimir Relatório da Data</button>
        <button onClick={limparDiaSelecionado} style={styles.red}>🧹 Limpar Histórico da Data</button>
      </div>

      <div style={styles.card}>
        <h2>Resumo da Data: {dataRelatorio}</h2>
        <p>Comandas fechadas: {rel.comandas.length}</p>
        <p>Itens vendidos: {rel.totalItens}</p>
        <p>Dinheiro: R$ {rel.caixaData.dinheiro.toFixed(2)}</p>
        <p>Pix: R$ {rel.caixaData.pix.toFixed(2)}</p>
        <p>Cartão: R$ {rel.caixaData.cartao.toFixed(2)}</p>
        <h3>Valor esperado: R$ {rel.totalVendas.toFixed(2)}</h3>
      </div>

      <div style={styles.card}>
        <h2>Resumo por Categoria</h2>
        {Object.keys(rel.categorias).map(cat => (
          <div key={cat} style={styles.box}>
            <h3>{cat} - R$ {rel.categorias[cat].total.toFixed(2)}</h3>
            {Object.keys(rel.categorias[cat].produtos).map(p => (
              <p key={p}>{p}: {rel.categorias[cat].produtos[p].qtd} un. | R$ {rel.categorias[cat].produtos[p].total.toFixed(2)}</p>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2>Estoque</h2>
        {Object.keys(estoque).map(prod => (
          <p key={prod}>
            {prod}: {estoque[prod]} un.
            {estoque[prod] <= 5 && <b style={{ color: 'red' }}> ⚠️ baixo</b>}
            <button onClick={() => reporEstoque(prod)} style={styles.repor}>Repor</button>
          </p>
        ))}
      </div>
    </div>
  )
}

const styles = {
  splash: { background: '#000', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial' },
  logoSplash: { width: 180, marginBottom: 15 },
  app: { background: '#111', color: '#fff', minHeight: '100vh', padding: 15, fontFamily: 'Arial' },
  logoBox: { textAlign: 'center' },
  logo: { maxWidth: 150, marginBottom: 10 },
  title: { color: '#ff3333' },
  card: { background: '#222', padding: 15, borderRadius: 12, marginBottom: 15 },
  cardDestaque: { background: '#331111', padding: 15, borderRadius: 12, marginBottom: 15, border: '2px solid #ff3333' },
  box: { background: '#111', padding: 10, borderRadius: 8, marginBottom: 10 },
  input: { width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 },
  green: { width: '100%', padding: 14, background: '#00c853', color: '#fff', border: 'none', borderRadius: 10, marginTop: 7, fontWeight: 'bold' },
  red: { width: '100%', padding: 14, background: '#d50000', color: '#fff', border: 'none', borderRadius: 10, marginTop: 7, fontWeight: 'bold' },
  yellow: { width: '100%', padding: 14, background: '#ffb300', color: '#111', border: 'none', borderRadius: 10, marginTop: 7, fontWeight: 'bold' },
  itemBtn: { width: '100%', minHeight: 70, padding: 12, background: '#333', color: '#fff', border: 'none', borderRadius: 12, marginTop: 5, textAlign: 'center', fontSize: 15 },
  execBtn: { width: '100%', minHeight: 85, padding: 12, background: '#5a0000', color: '#fff', border: '2px solid #ff3333', borderRadius: 12, marginTop: 5, textAlign: 'center', fontSize: 16 },
  selectedBtn: { width: '100%', padding: 14, background: '#00c853', color: '#fff', border: 'none', borderRadius: 10, marginTop: 6, textAlign: 'center', fontWeight: 'bold' },
  smallBtn: { padding: 10, background: '#444', color: '#fff', border: 'none', borderRadius: 8, margin: 4 },
  itemLinha: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, borderBottom: '1px solid #444', paddingBottom: 4 },
  repor: { marginLeft: 10, padding: 5 }
}