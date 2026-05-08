import React, { useEffect, useState } from 'react'
import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

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
    { nome: 'Medalhão de Frango', preco: 12, premium: true },
    { nome: 'Linguiça Cuiabana', preco: 12, premium: true },
    { nome: 'Misto Especial', preco: 12, premium: true }
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
const precoReferencia = {}

Object.values(cardapio).flat().forEach(item => {
  const nomeEstoque = item.estoqueNome || item.nome
  estoqueInicial[nomeEstoque] = 50
  if (!precoReferencia[nomeEstoque]) precoReferencia[nomeEstoque] = item.preco
})

const hoje = () => {
  const data = new Date()
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [comandas, setComandas] = useState([])
  const [historico, setHistorico] = useState([])
  const [comandaAtual, setComandaAtual] = useState(null)
  const [cliente, setCliente] = useState('')
  const [atendente, setAtendente] = useState(localStorage.getItem('atendente_mestre') || '')
  const [pagamento, setPagamento] = useState('dinheiro')
  const [estoque, setEstoque] = useState(estoqueInicial)
  const [estoqueInicialDia, setEstoqueInicialDia] = useState({})
  const [busca, setBusca] = useState('')
  const [dataRelatorio, setDataRelatorio] = useState(hoje())
  const [executivoSelecionado, setExecutivoSelecionado] = useState(null)
  const [espetosExecutivo, setEspetosExecutivo] = useState([])

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  useEffect(() => {
    localStorage.setItem('atendente_mestre', atendente)
  }, [atendente])

  useEffect(() => {
    const unsubComandas = onSnapshot(collection(db, 'comandas'), snapshot => {
      setComandas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const unsubHistorico = onSnapshot(collection(db, 'historico'), snapshot => {
      setHistorico(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const unsubEstoque = onSnapshot(doc(db, 'controle', 'estoque'), async snap => {
      if (snap.exists()) {
        setEstoque({ ...estoqueInicial, ...snap.data() })
      } else {
        await setDoc(doc(db, 'controle', 'estoque'), estoqueInicial)
      }
    })

    return () => {
      unsubComandas()
      unsubHistorico()
      unsubEstoque()
    }
  }, [])

  useEffect(() => {
    if (!comandaAtual) return
    const atual = comandas.find(c => c.id === comandaAtual.id)
    if (atual) setComandaAtual(atual)
  }, [comandas])

  useEffect(() => {
    const ref = doc(db, 'estoquesIniciais', dataRelatorio)

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setEstoqueInicialDia(snap.data())
      else setEstoqueInicialDia({})
    })

    return () => unsub()
  }, [dataRelatorio])

  const tocarSom = (arquivo) => {
    try { new Audio(arquivo).play() } catch (e) {}
  }

  const salvarEstoque = async (novoEstoque) => {
    await setDoc(doc(db, 'controle', 'estoque'), novoEstoque)
  }

  const criarComanda = async () => {
    if (!atendente.trim()) return alert('Digite o nome do atendente.')
    if (!cliente.trim()) return alert('Digite nome, mesa ou referência.')

    const nova = {
      cliente,
      atendente,
      itens: [],
      abertaEm: new Date().toISOString(),
      criadoEm: serverTimestamp()
    }

    tocarSom('/nova-comanda.mp3')
    const ref = await addDoc(collection(db, 'comandas'), nova)
    setComandaAtual({ id: ref.id, ...nova })
    setCliente('')
  }

  const atualizarComanda = async (nova) => {
    setComandaAtual(nova)
    await updateDoc(doc(db, 'comandas', nova.id), {
      itens: nova.itens
    })
  }

  const adicionarItem = async (item, categoria) => {
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

    const itemVenda = {
      nome: item.nome,
      preco: item.preco,
      categoria,
      tipo: item.premiumExecutivo ? 'premium-executivo' : 'normal',
      estoqueNome: nomeEstoque
    }

    await salvarEstoque(novoEstoque)
    await atualizarComanda({
      ...comandaAtual,
      itens: [...(comandaAtual.itens || []), itemVenda]
    })

    if (novoEstoque[nomeEstoque] <= 5) tocarSom('/alerta.mp3')
  }

  const abrirSelecaoExecutivo = (item) => {
    if (!comandaAtual) return alert('Selecione ou crie uma comanda.')
    setExecutivoSelecionado(item)
    setEspetosExecutivo([])
  }

  const adicionarEspetoExecutivo = (espeto) => {
    if (espetosExecutivo.length >= executivoSelecionado.qtdEspetos) {
      return alert(`Esse prato permite escolher ${executivoSelecionado.qtdEspetos} espetos.`)
    }

    if ((estoque[espeto.nome] || 0) <= 0) {
      tocarSom('/alerta.mp3')
      return alert(`${espeto.nome} está sem estoque.`)
    }

    setEspetosExecutivo([
      ...espetosExecutivo,
      {
        nome: espeto.nome,
        premium: !!espeto.premium,
        adicional: espeto.premium ? 10 : 0
      }
    ])
  }

  const removerEspetoExecutivo = (index) => {
    const novaLista = [...espetosExecutivo]
    novaLista.splice(index, 1)
    setEspetosExecutivo(novaLista)
  }

  const confirmarExecutivo = async () => {
    if (!executivoSelecionado) return

    if (espetosExecutivo.length !== executivoSelecionado.qtdEspetos) {
      return alert(`Selecione exatamente ${executivoSelecionado.qtdEspetos} espetos.`)
    }

    let novoEstoque = { ...estoque }

    for (const espeto of espetosExecutivo) {
      if ((novoEstoque[espeto.nome] || 0) <= 0) {
        tocarSom('/alerta.mp3')
        return alert(`${espeto.nome} está sem estoque.`)
      }
      novoEstoque[espeto.nome] -= 1
    }

    const adicionalPremium = espetosExecutivo.reduce((acc, e) => acc + (e.adicional || 0), 0)
    const precoFinal = executivoSelecionado.preco + adicionalPremium

    const itemVenda = {
      nome: executivoSelecionado.nome,
      preco: precoFinal,
      precoBase: executivoSelecionado.preco,
      adicionalPremium,
      categoria: 'Executivos',
      tipo: 'executivo',
      espetosInclusos: espetosExecutivo.map(e => e.nome),
      detalhesEspetos: espetosExecutivo
    }

    await salvarEstoque(novoEstoque)
    await atualizarComanda({
      ...comandaAtual,
      itens: [...(comandaAtual.itens || []), itemVenda]
    })

    setExecutivoSelecionado(null)
    setEspetosExecutivo([])
  }

  const removerItem = async (index) => {
    const item = comandaAtual.itens[index]
    const novosItens = [...comandaAtual.itens]
    novosItens.splice(index, 1)

    let novoEstoque = { ...estoque }

    if (item.tipo === 'executivo') {
      ;(item.espetosInclusos || []).forEach(e => {
        novoEstoque[e] = (novoEstoque[e] || 0) + 1
      })
    } else {
      const nomeEstoque = item.estoqueNome || item.nome
      novoEstoque[nomeEstoque] = (novoEstoque[nomeEstoque] || 0) + 1
    }

    await salvarEstoque(novoEstoque)
    await atualizarComanda({ ...comandaAtual, itens: novosItens })
  }

  const total = comandaAtual
    ? (comandaAtual.itens || []).reduce((acc, i) => acc + i.preco, 0)
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
      return `${item.nome} - R$ ${item.preco.toFixed(2)}\n  Espetos: ${item.espetosInclusos.join(', ')}${item.adicionalPremium ? `\n  Adicional premium: R$ ${item.adicionalPremium.toFixed(2)}` : ''}`
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
${(comandaAtual.itens || []).map(i => {
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
${(comandaAtual.itens || []).map(descricaoItem).join('\n')}
------------------------
TOTAL: R$ ${total.toFixed(2)}
Pagamento: ${pagamento.toUpperCase()}

Obrigado e volte sempre!
`
    imprimirTexto(texto)
  }

  const fecharComanda = async () => {
    if (!comandaAtual) return
    if (!comandaAtual.itens || comandaAtual.itens.length === 0) return alert('Comanda sem itens.')

    const dataFechamento = hoje()

    await addDoc(collection(db, 'historico'), {
      ...comandaAtual,
      pagamento,
      total,
      dataFechamento,
      fechadoEm: new Date().toISOString(),
      criadoEm: serverTimestamp()
    })

    await deleteDoc(doc(db, 'comandas', comandaAtual.id))
    setComandaAtual(null)
  }

  const calcularSaidasEstoque = (vendas) => {
    const saidas = {}

    vendas.forEach(c => {
      ;(c.itens || []).forEach(item => {
        if (item.tipo === 'executivo') {
          ;(item.espetosInclusos || []).forEach(nome => {
            saidas[nome] = (saidas[nome] || 0) + 1
          })
        } else {
          const nome = item.estoqueNome || item.nome
          saidas[nome] = (saidas[nome] || 0) + 1
        }
      })
    })

    return saidas
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

      ;(c.itens || []).forEach(item => {
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

    const saidasEstoque = calcularSaidasEstoque(filtrado)

    const conferenciaEstoque = Object.keys({ ...estoqueInicial, ...estoque }).map(prod => {
      const inicial = estoqueInicialDia[prod] ?? 0
      const saida = saidasEstoque[prod] || 0
      const esperado = inicial - saida
      const real = estoque[prod] ?? 0
      const diferenca = real - esperado
      const valorDiferenca = diferenca < 0 ? Math.abs(diferenca) * (precoReferencia[prod] || 0) : 0

      return {
        produto: prod,
        inicial,
        saida,
        esperado,
        real,
        diferenca,
        valorDiferenca
      }
    })

    const lista = Object.entries(produtos)

    return {
      comandas: filtrado,
      categorias,
      produtos,
      caixaData,
      totalVendas,
      totalItens,
      saidasEstoque,
      conferenciaEstoque,
      maisSaiu: lista.length ? lista.reduce((a, b) => a[1].qtd > b[1].qtd ? a : b) : null,
      menosSaiu: lista.length ? lista.reduce((a, b) => a[1].qtd < b[1].qtd ? a : b) : null
    }
  }

  const rel = relatorioPorData(dataRelatorio)
  const totalCaixaData = rel.caixaData.dinheiro + rel.caixaData.pix + rel.caixaData.cartao
  const perdaEstimada = rel.conferenciaEstoque.reduce((acc, item) => acc + item.valorDiferenca, 0)

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

  return `${cat.toUpperCase()} - R$ ${c.total.toFixed(2)} | ${c.qtd} un.

${Object.keys(c.produtos).map(produto => {
    const p = c.produtos[produto]
    return `  - ${produto}: ${p.qtd} un. | R$ ${p.total.toFixed(2)}`
  }).join('\n')}

`
}).join('\n')}

------------------------
CAIXA DO DIA

Dinheiro: R$ ${rel.caixaData.dinheiro.toFixed(2)}
Pix: R$ ${rel.caixaData.pix.toFixed(2)}
Cartão: R$ ${rel.caixaData.cartao.toFixed(2)}

Valor esperado: R$ ${rel.totalVendas.toFixed(2)}
Valor registrado: R$ ${totalCaixaData.toFixed(2)}
Diferença: R$ ${(totalCaixaData - rel.totalVendas).toFixed(2)}

------------------------
CONSUMO REAL DE ESTOQUE

${Object.entries(rel.saidasEstoque || {})
  .map(([nome, qtd]) => `${nome}: ${qtd} un.`)
  .join('\n')}

------------------------
CONFERÊNCIA DE ESTOQUE

${rel.conferenciaEstoque.map(item => `
${item.produto}

Inicial: ${item.inicial}
Saída: ${item.saida}
Esperado: ${item.esperado}
Real contado: ${item.real}
Diferença: ${item.diferenca}
Perda estimada: R$ ${item.valorDiferenca.toFixed(2)}
`).join('\n')}

------------------------
PERDA ESTIMADA TOTAL: R$ ${perdaEstimada.toFixed(2)}

MESTRE DO ESPETO PDV
`

  imprimirTexto(texto)
}

  const registrarEstoqueInicialDia = async () => {
    const confirmar = confirm(`Registrar o estoque atual como estoque inicial do dia ${dataRelatorio}?`)
    if (!confirmar) return

    await setDoc(doc(db, 'estoquesIniciais', dataRelatorio), estoque)
    alert('Estoque inicial do dia registrado com sucesso.')
  }

  const limparDiaSelecionado = async () => {
    const confirmar = confirm(`Deseja apagar TODAS as comandas abertas e fechadas do dia ${dataRelatorio}?`)
    if (!confirmar) return

    try {
      const docsDoDia = historico.filter(c => c.dataFechamento === dataRelatorio)

      await Promise.all([
        ...docsDoDia.map(c => deleteDoc(doc(db, 'historico', c.id))),
        ...comandas.map(c => deleteDoc(doc(db, 'comandas', c.id)))
      ])

      setHistorico(historico.filter(c => c.dataFechamento !== dataRelatorio))
      setComandas([])
      setComandaAtual(null)

      alert('Comandas abertas e histórico da data foram apagados.')
    } catch (error) {
      console.error(error)
      alert('Erro ao limpar testes do dia.')
    }
  }

  const reporEstoque = async (produto) => {
    const qtd = Number(prompt(`Quantidade para repor ${produto}:`))
    if (!qtd || qtd <= 0) return
    await salvarEstoque({ ...estoque, [produto]: (estoque[produto] || 0) + qtd })
  }

  const definirEstoque = async (produto) => {
    const qtd = Number(prompt(`Digite o estoque EXATO de ${produto}:`))
    if (qtd < 0 || Number.isNaN(qtd)) return
    await salvarEstoque({ ...estoque, [produto]: qtd })
  }

  const comandasFiltradas = comandas.filter(c =>
    (c.cliente || '').toLowerCase().includes(busca.toLowerCase())
  )

  const opcoesEspetos = [
    ...cardapio.Espetos.map(e => ({ ...e, premium: false })),
    ...cardapio['Espetos Premium Avulso'].map(e => ({ ...e, premium: true }))
  ]

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
        <h1 style={styles.title}>MESTRE DO ESPETO — PDV ONLINE</h1>
        <p style={{ color: '#00c853' }}>🟢 Sincronizado em tempo real</p>
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
        <h2>Comandas Abertas em Tempo Real</h2>
        <input placeholder="Buscar comanda..." value={busca} onChange={e => setBusca(e.target.value)} style={styles.input} />
        {comandasFiltradas.map(c => (
          <button key={c.id} onClick={() => setComandaAtual(c)} style={styles.smallBtn}>
            {c.cliente} — {(c.itens || []).length} itens
          </button>
        ))}
      </div>

      {executivoSelecionado && (
        <div style={styles.cardDestaque}>
          <h2>{executivoSelecionado.nome}</h2>
          <p>Selecione {executivoSelecionado.qtdEspetos} espetos. Pode repetir o mesmo espeto.</p>
          <p>Premium substitui o espeto tradicional por + R$10,00.</p>

          <h3>Selecionados:</h3>
          {espetosExecutivo.length === 0 && <p>Nenhum selecionado</p>}
          {espetosExecutivo.map((e, index) => (
            <div key={index} style={styles.itemLinha}>
              <span>{index + 1}. {e.nome} {e.premium ? '(Premium + R$10)' : ''}</span>
              <button onClick={() => removerEspetoExecutivo(index)}>❌</button>
            </div>
          ))}

          <div style={styles.grid}>
            {opcoesEspetos.map(e => (
              <button
                key={e.nome}
                onClick={() => adicionarEspetoExecutivo(e)}
                style={e.premium ? styles.premiumBtn : styles.itemBtn}
              >
                <strong>{e.nome}</strong><br />
                {e.premium ? 'Premium + R$10 no executivo' : 'Incluso no executivo'}<br />
                Estoque: {estoque[e.nome] || 0}
              </button>
            ))}
          </div>

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
          {(comandaAtual.itens || []).map((item, index) => (
            <div key={index} style={styles.itemLinha}>
              <span>
                {item.nome} — R$ {item.preco.toFixed(2)}
                {item.tipo === 'executivo' && <small><br />Espetos: {item.espetosInclusos.join(', ')}</small>}
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
        <h2>Relatório por Data</h2>
        <input type="date" value={dataRelatorio} onChange={e => setDataRelatorio(e.target.value)} style={styles.input} />
        <button onClick={registrarEstoqueInicialDia} style={styles.yellow}>📌 Registrar Estoque Inicial do Dia</button>
        <button onClick={imprimirRelatorioData} style={styles.green}>🧾 Imprimir Fechamento Detalhado</button>
        <button onClick={limparDiaSelecionado} style={styles.red}>🧹 Limpar Testes do Dia</button>
      </div>

      <div style={styles.card}>
        <h2>Resumo da Data: {dataRelatorio}</h2>
        <p>Comandas fechadas: {rel.comandas.length}</p>
        <p>Itens vendidos: {rel.totalItens}</p>
        <p>Dinheiro: R$ {rel.caixaData.dinheiro.toFixed(2)}</p>
        <p>Pix: R$ {rel.caixaData.pix.toFixed(2)}</p>
        <p>Cartão: R$ {rel.caixaData.cartao.toFixed(2)}</p>
        <h3>Valor esperado: R$ {rel.totalVendas.toFixed(2)}</h3>
        <h3 style={{ color: perdaEstimada > 0 ? '#ff3333' : '#00c853' }}>Perda estimada no estoque: R$ {perdaEstimada.toFixed(2)}</h3>
      </div>

      <div style={styles.card}>
        <h2>Conferência de Estoque</h2>
        {rel.conferenciaEstoque.map(i => (
          <div key={i.produto} style={styles.box}>
            <strong>{i.produto}</strong>
            <p>Inicial: {i.inicial} | Saída: {i.saida} | Esperado: {i.esperado} | Real: {i.real}</p>
            <p>Diferença: {i.diferenca} | Perda estimada: R$ {i.valorDiferenca.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2>Estoque em Tempo Real</h2>
        {Object.keys(estoque).map(prod => (
          <p key={prod}>
            {prod}: {estoque[prod]} un.
            {estoque[prod] <= 5 && <b style={{ color: 'red' }}> ⚠️ baixo</b>}
            <button onClick={() => reporEstoque(prod)} style={styles.repor}>Repor</button>
            <button onClick={() => definirEstoque(prod)} style={styles.repor}>Ajustar</button>
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
  premiumBtn: { width: '100%', minHeight: 70, padding: 12, background: '#3b2600', color: '#ffd166', border: '1px solid #ffb300', borderRadius: 12, marginTop: 5, textAlign: 'center', fontSize: 15 },
  execBtn: { width: '100%', minHeight: 85, padding: 12, background: '#5a0000', color: '#fff', border: '2px solid #ff3333', borderRadius: 12, marginTop: 5, textAlign: 'center', fontSize: 16 },
  selectedBtn: { width: '100%', padding: 14, background: '#00c853', color: '#fff', border: 'none', borderRadius: 10, marginTop: 6, textAlign: 'center', fontWeight: 'bold' },
  smallBtn: { padding: 10, background: '#444', color: '#fff', border: 'none', borderRadius: 8, margin: 4 },
  itemLinha: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, borderBottom: '1px solid #444', paddingBottom: 4 },
  repor: { marginLeft: 10, padding: 5 }
}