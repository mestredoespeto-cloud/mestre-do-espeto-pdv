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
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore'

const cardapioPadrao = {
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
  { nome: 'Misto Especial', preco: 12, premium: true },
  { nome: 'Espeto de Almôndega', preco: 12, premium: true }
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
  { nome: 'Original 300ml', preco: 6 },
  { nome: 'Combo 3 Original', preco: 15 },
  { nome: 'Heineken Long Neck 330ml', preco: 12 },
  { nome: 'Heineken Long Neck Zero 330ml', preco: 12 },
  { nome: 'Energético Monster 473ml', preco: 12 }
]
}

const estoqueInicial = {}
const precoReferencia = {}

Object.values(cardapioPadrao).flat().forEach(item => {
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

const custosPadrao = {
  'Carne Bovina': 5.2,
  'Frango': 4,
  'Kafta': 5,
  'Medalhão de Frango': 7,
  'Original 300ml': 2,
  'Coca-Cola Lata': 3.7
}

const montarItensPadraoCardapio = () => {
  const itens = []

  Object.keys(cardapioPadrao).forEach(categoria => {
    cardapioPadrao[categoria].forEach(item => {
      itens.push({
        ...item,
        categoria,
        precoVenda: item.preco,
        precoCusto: custosPadrao[item.nome] || 0,
        controlaEstoque: true,
        ativo: true
      })
    })
  })

  return itens
}

const agruparCardapio = (itens) => {
  const grupos = {}

  itens
    .filter(item => item.ativo !== false)
    .forEach(item => {
      const categoria = item.categoria || 'Outros'
      if (!grupos[categoria]) grupos[categoria] = []

      grupos[categoria].push({
        ...item,
        preco: Number(item.precoVenda ?? item.preco ?? 0)
      })
    })

  return grupos
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [comandas, setComandas] = useState([])
  const [historico, setHistorico] = useState([])
  const [comandaAtual, setComandaAtual] = useState(null)
  const [cliente, setCliente] = useState('')
  const [tipoComanda, setTipoComanda] = useState('Cliente')
  const [motivo, setMotivo] = useState('')
  const [atendente, setAtendente] = useState(localStorage.getItem('atendente_mestre') || '')
  const [pagamento, setPagamento] = useState('dinheiro')
  const [estoque, setEstoque] = useState(estoqueInicial)
  const [estoqueInicialDia, setEstoqueInicialDia] = useState({})
  const [busca, setBusca] = useState('')
  const [dataRelatorio, setDataRelatorio] = useState(hoje())
  const [executivoSelecionado, setExecutivoSelecionado] = useState(null)
  const [espetosExecutivo, setEspetosExecutivo] = useState([])
  const [cardapio, setCardapio] = useState(cardapioPadrao)
  const [itensCardapio, setItensCardapio] = useState([])

  const [mostrarGestaoCardapio, setMostrarGestaoCardapio] = useState(false)
  const [mostrarEstoque, setMostrarEstoque] = useState(false)

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

  useEffect(() => {
    const unsubCardapio = onSnapshot(collection(db, 'cardapio'), async snapshot => {
      if (snapshot.empty) {
        const itensPadrao = montarItensPadraoCardapio()

        await Promise.all(
          itensPadrao.map(item => addDoc(collection(db, 'cardapio'), item))
        )

        setItensCardapio(itensPadrao)
        setCardapio(agruparCardapio(itensPadrao))
        return
      }

      const itens = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))

      setItensCardapio(itens)
      setCardapio(agruparCardapio(itens))
    })

    return () => unsubCardapio()
  }, [])

  const tocarSom = (arquivo) => {
    try { new Audio(arquivo).play() } catch (e) {}
  }

  const salvarEstoque = async (novoEstoque) => {
    await setDoc(doc(db, 'controle', 'estoque'), novoEstoque)
  }


  const custoProduto = (nome) => {
    const item = itensCardapio.find(i =>
      i.nome === nome || (i.estoqueNome || i.nome) === nome
    )

    return Number(item?.precoCusto ?? custosPadrao[nome] ?? 0)
  }

  const itemEhEspeto = (nome, categoria = '') => {
    const listaEspetos = [
      ...(cardapio.Espetos || []),
      ...(cardapio['Espetos Premium Avulso'] || [])
    ]

    return categoria.includes('Espetos') || listaEspetos.some(i => i.nome === nome)
  }

const calcularFinanceiroComanda = (comanda, historicoBase = historico) => {
  const tipo = comanda.tipoComanda || 'Cliente'
  const nomePessoa = (comanda.cliente || '').trim()
  const dataBase = hoje()

  let totalVenda = 0
  let totalCusto = 0
  let totalRepasse = 0
  let quantidadeEspetosInternos = 0

  const sociosMesmoDia = historicoBase.filter(h =>
    (h.tipoComanda || 'Cliente') === 'Sócios' &&
    (h.cliente || '').trim().toLowerCase() === nomePessoa.toLowerCase() &&
    h.dataFechamento === dataBase
  )

  const espetosJaConsumidosSocio = sociosMesmoDia.reduce((acc, h) => {
    return acc + Number(h.quantidadeEspetosInternos || 0)
  }, 0)

  let franquiaRestanteSocio = tipo === 'Sócios'
    ? Math.max(0, 2 - espetosJaConsumidosSocio)
    : 0

  ;(comanda.itens || []).forEach(item => {
    totalVenda += Number(item.precoVenda ?? item.preco ?? 0)

    if (item.tipo === 'executivo') {
      const listaEspetos = item.detalhesEspetos && item.detalhesEspetos.length
        ? item.detalhesEspetos.map(e => e.nome)
        : (item.espetosInclusos || [])

      listaEspetos.forEach(nomeEspeto => {
        const custo = custoProduto(nomeEspeto)
        totalCusto += custo
        quantidadeEspetosInternos += 1

        if (tipo === 'Sócios') {
          if (franquiaRestanteSocio > 0) {
            franquiaRestanteSocio -= 1
          } else {
            totalRepasse += custo
          }
        }

        if (tipo === 'Família') {
          totalRepasse += custo
        }
      })

      return
    }

    const nomeEstoque = item.estoqueNome || item.nome
    const custo = custoProduto(nomeEstoque)
    totalCusto += custo

    const categoria = item.categoria || ''
    const ehEspeto = categoria.includes('Espeto')

    if (ehEspeto) {
      quantidadeEspetosInternos += 1
    }

    if (tipo === 'Cliente') {
      return
    }

    if (tipo === 'Cortesia') {
      return
    }

    if (tipo === 'Família') {
      totalRepasse += custo
      return
    }

    if (tipo === 'Sócios') {
      if (ehEspeto && franquiaRestanteSocio > 0) {
        franquiaRestanteSocio -= 1
        return
      }

      totalRepasse += custo
    }
  })

  return {
    totalVenda,
    totalCusto,
    totalRepasse,
    quantidadeEspetosInternos
  }
}

  const criarComanda = async () => {
  if (!atendente.trim()) {
    alert('Digite o nome do atendente.')
    return
  }

  if (!cliente.trim()) {
    alert('Digite nome, mesa ou referência.')
    return
  }

  try {
    const nova = {
      cliente: cliente.trim(),
      tipoComanda,
      motivo: motivo.trim(),
      atendente: atendente.trim(),
      itens: [],
      abertaEm: new Date().toISOString(),
      criadoEm: serverTimestamp()
    }

    const ref = await addDoc(collection(db, 'comandas'), nova)

    setComandaAtual({
      id: ref.id,
      ...nova
    })

    setComandas(prev => [
      ...prev,
      {
        id: ref.id,
        ...nova
      }
    ])

    setCliente('')
    setMotivo('')
    tocarSom('/nova-comanda.mp3')

    alert('Comanda criada com sucesso!')
  } catch (error) {
    console.error('Erro ao criar comanda:', error)
    alert('Erro ao criar comanda. Verifique o Firebase.')
  }
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
      precoCusto: Number(item.precoCusto ?? custoProduto(nomeEstoque)),
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
        precoCusto: custoProduto(espeto.nome),
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

  const financeiroComandaAtual = comandaAtual
    ? calcularFinanceiroComanda(comandaAtual)
    : { totalVenda: 0, totalCusto: 0, totalRepasse: 0, quantidadeEspetosInternos: 0 }

  const totalVendaComandaAtual = Number(financeiroComandaAtual.totalVenda || 0)

  const total = comandaAtual
    ? ((comandaAtual.tipoComanda || 'Cliente') === 'Cliente'
      ? totalVendaComandaAtual
      : Number(financeiroComandaAtual.totalRepasse || 0))
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
${(comandaAtual.tipoComanda || 'Cliente') === 'Cliente'
  ? `TOTAL: R$ ${total.toFixed(2)}
Pagamento: ${pagamento.toUpperCase()}`
  : `VALOR DE VENDA (NÃO ENTRA NO CAIXA): R$ ${totalVendaComandaAtual.toFixed(2)}
TOTAL A REPASSAR / CUSTO: R$ ${total.toFixed(2)}`}

Obrigado e volte sempre!
`
    imprimirTexto(texto)
  }

  const fecharComanda = async () => {
    if (!comandaAtual) return
    if (!comandaAtual.itens || comandaAtual.itens.length === 0) return alert('Comanda sem itens.')

    const dataFechamento = hoje()
    const financeiro = calcularFinanceiroComanda(comandaAtual)

    await addDoc(collection(db, 'historico'), {
      ...comandaAtual,
      pagamento,
      total: (comandaAtual.tipoComanda || 'Cliente') === 'Cliente' ? financeiro.totalVenda : financeiro.totalRepasse,
      totalVenda: financeiro.totalVenda,
      totalCusto: financeiro.totalCusto,
      totalRepasse: financeiro.totalRepasse,
      quantidadeEspetosInternos: financeiro.quantidadeEspetosInternos,
      dataFechamento,
      fechadoEm: new Date().toISOString(),
      criadoEm: serverTimestamp()
    })

     await deleteDoc(doc(db, 'comandas', comandaAtual.id))
  setComandaAtual(null)
}

const excluirComandaAberta = async () => {
  if (!comandaAtual) return alert('Selecione uma comanda para excluir.')

  const confirmar = confirm(
    `Deseja excluir a comanda de ${comandaAtual.cliente}? Os itens serão devolvidos ao estoque.`
  )

  if (!confirmar) return

  let novoEstoque = { ...estoque }

  ;(comandaAtual.itens || []).forEach(item => {
    if (item.tipo === 'executivo') {
      ;(item.espetosInclusos || []).forEach(nome => {
        novoEstoque[nome] = (novoEstoque[nome] || 0) + 1
      })
    } else {
      const nomeEstoque = item.estoqueNome || item.nome
      novoEstoque[nomeEstoque] = (novoEstoque[nomeEstoque] || 0) + 1
    }
  })

  await salvarEstoque(novoEstoque)
  await deleteDoc(doc(db, 'comandas', comandaAtual.id))

  setComandaAtual(null)

  alert('Comanda excluída com sucesso.')
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
    const consumoInterno = {}
    let totalVendas = 0
    let totalConsumoInterno = 0
    let totalRepasseInterno = 0
    let totalItens = 0

    filtrado.forEach(c => {
      const tipo = c.tipoComanda || 'Cliente'
      const valorVenda = Number(c.totalVenda ?? c.total ?? 0)
      const valorCusto = Number(c.totalCusto || 0)
      const valorRepasse = Number(c.totalRepasse || 0)

      if (tipo === 'Cliente') {
        totalVendas += valorVenda
        caixaData[c.pagamento] = (caixaData[c.pagamento] || 0) + valorVenda
      } else {
        totalConsumoInterno += valorCusto
        totalRepasseInterno += valorRepasse

        if (!consumoInterno[tipo]) {
          consumoInterno[tipo] = {
            totalCusto: 0,
            totalRepasse: 0,
            comandas: {}
          }
        }

        consumoInterno[tipo].totalCusto += valorCusto
        consumoInterno[tipo].totalRepasse += valorRepasse

        const nome = c.cliente || 'Sem nome'
        if (!consumoInterno[tipo].comandas[nome]) {
          consumoInterno[tipo].comandas[nome] = {
            totalCusto: 0,
            totalRepasse: 0,
            quantidadeEspetos: 0
          }
        }

        consumoInterno[tipo].comandas[nome].totalCusto += valorCusto
        consumoInterno[tipo].comandas[nome].totalRepasse += valorRepasse
        consumoInterno[tipo].comandas[nome].quantidadeEspetos += Number(c.quantidadeEspetosInternos || 0)
      }

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
      const precoBase = Object.values(cardapio).flat().find(item => (item.estoqueNome || item.nome) === prod)?.preco || precoReferencia[prod] || 0
      const valorDiferenca = diferenca < 0 ? Math.abs(diferenca) * precoBase : 0

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
      totalConsumoInterno,
      totalRepasseInterno,
      consumoInterno,
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
  const consumoInternoTexto = Object.keys(rel.consumoInterno || {}).length
    ? Object.keys(rel.consumoInterno).map(tipo => {
        const grupo = rel.consumoInterno[tipo]
        const detalhes = Object.keys(grupo.comandas).map(nome => {
          const c = grupo.comandas[nome]
          return `${nome}
  Espetos consumidos: ${c.quantidadeEspetos}
  Custo consumo: R$ ${c.totalCusto.toFixed(2)}
  A repassar: R$ ${c.totalRepasse.toFixed(2)}`
        }).join('\n\n')

        return `${tipo.toUpperCase()}
${detalhes}

Total custo ${tipo}: R$ ${grupo.totalCusto.toFixed(2)}
Total a repassar ${tipo}: R$ ${grupo.totalRepasse.toFixed(2)}`
      }).join('\n\n------------------------\n')
    : 'Nenhum consumo interno registrado.'

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

Faturamento clientes: R$ ${rel.totalVendas.toFixed(2)}
Consumo interno a custo: R$ ${rel.totalConsumoInterno.toFixed(2)}
Total a repassar: R$ ${rel.totalRepasseInterno.toFixed(2)}

Valor esperado: R$ ${rel.totalVendas.toFixed(2)}
Valor registrado: R$ ${totalCaixaData.toFixed(2)}
Diferença: R$ ${(totalCaixaData - rel.totalVendas).toFixed(2)}

------------------------
CONSUMO INTERNO / REPASSES

${consumoInternoTexto}

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
    const qHistorico = query(
      collection(db, 'historico'),
      where('dataFechamento', '==', dataRelatorio)
    )

    const historicoSnapshot = await getDocs(qHistorico)

    const promessasHistorico = historicoSnapshot.docs.map(d =>
      deleteDoc(doc(db, 'historico', d.id))
    )

    const promessasComandas = comandas.map(c =>
      deleteDoc(doc(db, 'comandas', c.id))
    )

    await Promise.all([
      ...promessasHistorico,
      ...promessasComandas
    ])

    setHistorico([])
    setComandas([])
    setComandaAtual(null)

    alert('Resumo, histórico e comandas abertas foram apagados com sucesso.')

    window.location.reload()

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

  const adicionarItemCardapio = async () => {
    const nome = prompt('Nome do item:')
    if (!nome || !nome.trim()) return

    const categoria = prompt('Categoria: Espetos, Espetos Premium Avulso, Executivos, Adicionais ou Bebidas:', 'Espetos')
    if (!categoria || !categoria.trim()) return

    const precoVenda = Number(String(prompt('Preço de venda:', '10') || '').replace(',', '.'))
    if (Number.isNaN(precoVenda) || precoVenda < 0) return alert('Preço de venda inválido.')

    const precoCusto = Number(String(prompt('Preço de custo:', '0') || '').replace(',', '.'))
    if (Number.isNaN(precoCusto) || precoCusto < 0) return alert('Preço de custo inválido.')

    const premium = confirm('Este item é premium? Clique OK para SIM ou Cancelar para NÃO.')

    let qtdEspetos = null
    if (categoria === 'Executivos') {
      qtdEspetos = Number(prompt('Quantos espetos este executivo permite escolher?', '2'))
      if (!qtdEspetos || qtdEspetos <= 0) return alert('Quantidade de espetos inválida.')
    }

    const novoItem = {
      nome: nome.trim(),
      categoria: categoria.trim(),
      precoVenda,
      precoCusto,
      preco: precoVenda,
      premium,
      controlaEstoque: true,
      ativo: true
    }

    if (qtdEspetos) novoItem.qtdEspetos = qtdEspetos

    await addDoc(collection(db, 'cardapio'), novoItem)

    const nomeEstoque = novoItem.estoqueNome || novoItem.nome
    if (estoque[nomeEstoque] === undefined) {
      await salvarEstoque({ ...estoque, [nomeEstoque]: 0 })
    }

    alert('Item adicionado ao cardápio com sucesso.')
  }

  const editarItemCardapio = async (item) => {
    if (!item.id) return alert('Esse item ainda não tem ID no Firebase. Atualize a página e tente novamente.')

    const novoNome = prompt('Nome do item:', item.nome)
    if (!novoNome || !novoNome.trim()) return

    const novaCategoria = prompt('Categoria:', item.categoria || 'Espetos')
    if (!novaCategoria || !novaCategoria.trim()) return

    const precoVenda = Number(String(prompt('Preço de venda:', String(item.precoVenda ?? item.preco ?? 0)) || '').replace(',', '.'))
    if (Number.isNaN(precoVenda) || precoVenda < 0) return alert('Preço de venda inválido.')

    const precoCusto = Number(String(prompt('Preço de custo:', String(item.precoCusto ?? 0)) || '').replace(',', '.'))
    if (Number.isNaN(precoCusto) || precoCusto < 0) return alert('Preço de custo inválido.')

    const premium = confirm('Este item é premium? Clique OK para SIM ou Cancelar para NÃO.')

    const dadosAtualizados = {
      nome: novoNome.trim(),
      categoria: novaCategoria.trim(),
      precoVenda,
      precoCusto,
      preco: precoVenda,
      premium,
      ativo: item.ativo !== false,
      controlaEstoque: item.controlaEstoque !== false
    }

    if (item.qtdEspetos) dadosAtualizados.qtdEspetos = item.qtdEspetos
    if (item.estoqueNome) dadosAtualizados.estoqueNome = item.estoqueNome
    if (item.premiumExecutivo) dadosAtualizados.premiumExecutivo = item.premiumExecutivo

    await updateDoc(doc(db, 'cardapio', item.id), dadosAtualizados)
    alert('Item atualizado com sucesso.')
  }

  const alternarAtivoItemCardapio = async (item) => {
    if (!item.id) return alert('Esse item ainda não tem ID no Firebase. Atualize a página e tente novamente.')

    await updateDoc(doc(db, 'cardapio', item.id), {
      ativo: item.ativo === false ? true : false
    })
  }

  const excluirItemCardapio = async (item) => {
    if (!item.id) return alert('Esse item ainda não tem ID no Firebase. Atualize a página e tente novamente.')

    const confirmar = confirm(`Deseja excluir ${item.nome} do cardápio?`)
    if (!confirmar) return

    await deleteDoc(doc(db, 'cardapio', item.id))
    alert('Item excluído do cardápio.')
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

        <select value={tipoComanda} onChange={e => setTipoComanda(e.target.value)} style={styles.input}>
          <option value="Cliente">Cliente</option>
          <option value="Sócios">Sócios</option>
          <option value="Família">Família</option>
          <option value="Cortesia">Cortesia</option>
        </select>

        {tipoComanda !== 'Cliente' && (
          <input
            placeholder="Motivo / observação opcional"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            style={styles.input}
          />
        )}

        <button onClick={criarComanda} style={styles.green}>➕ Criar Comanda</button>
      </div>

      <div style={styles.card}>
        <h2>Comandas Abertas em Tempo Real</h2>
        <input placeholder="Buscar comanda..." value={busca} onChange={e => setBusca(e.target.value)} style={styles.input} />
        {comandasFiltradas.map(c => (
          <button key={c.id} onClick={() => setComandaAtual(c)} style={styles.smallBtn}>
            {c.tipoComanda || 'Cliente'} — {c.cliente} — {(c.itens || []).length} itens
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
          <p>Tipo: {comandaAtual.tipoComanda || 'Cliente'} {comandaAtual.motivo ? `| Motivo: ${comandaAtual.motivo}` : ''}</p>

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
          {(comandaAtual.itens || []).map((item, index) => {
  const tipoAtual = comandaAtual.tipoComanda || 'Cliente'
  const nomeEstoque = item.estoqueNome || item.nome
  const custoItem = custoProduto(nomeEstoque)

  return (
    <div key={index} style={styles.itemLinha}>
      <span>
        {item.nome} — R$ {Number(item.precoVenda ?? item.preco ?? 0).toFixed(2)}

        {tipoAtual !== 'Cliente' && (
          <small>
            <br />
            Custo: R$ {custoItem.toFixed(2)}
          </small>
        )}

        {item.tipo === 'executivo' && (
          <small>
            <br />
            Espetos: {item.espetosInclusos.join(', ')}
          </small>
        )}
      </span>

      <button onClick={() => removerItem(index)}>❌</button>
    </div>
  )
})}

          {(comandaAtual.tipoComanda || 'Cliente') === 'Cliente' ? (
            <h2>Total: R$ {total.toFixed(2)}</h2>
          ) : (
            <div style={styles.box}>
              <h2>Total a repassar / custo: R$ {total.toFixed(2)}</h2>
              <p>Valor de venda apenas para referência: R$ {totalVendaComandaAtual.toFixed(2)}</p>
              <p>Este consumo não entra no faturamento de clientes.</p>
            </div>
          )}

          <select value={pagamento} onChange={e => setPagamento(e.target.value)} style={styles.input}>
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">Pix</option>
            <option value="cartao">Cartão</option>
          </select>

          <button onClick={imprimirCozinha} style={styles.yellow}>
  👨‍🍳 Imprimir Pedido Cozinha
</button>

<button onClick={imprimirCliente} style={styles.green}>
  🖨️ Imprimir Comanda Cliente
</button>

<button
  onClick={excluirComandaAberta}
  style={{
    background: '#dc2626',
    color: '#fff',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '10px',
    border: 'none',
    cursor: 'pointer'
  }}
>
  🗑️ Excluir Comanda Aberta
</button>

<button onClick={fecharComanda} style={styles.red}>
  💰 Fechar Comanda
</button>
        </div>
      )}

 <div style={styles.card}>
  <button
    onClick={() => setMostrarGestaoCardapio(!mostrarGestaoCardapio)}
    style={styles.yellow}
  >
    ⚙️ {mostrarGestaoCardapio ? 'Ocultar Gestão do Cardápio' : 'Abrir Gestão do Cardápio'}
  </button>

  {mostrarGestaoCardapio && (
    <>
      <h2>⚙️ Gestão do Cardápio</h2>

      <button onClick={adicionarItemCardapio} style={styles.green}>
        ➕ Adicionar Item ao Cardápio
      </button>

      {Object.keys(cardapio).map(cat => (
        <div key={cat} style={styles.box}>
          <h3>{cat}</h3>

          {cardapio[cat].map(item => (
            <div key={item.id || item.nome} style={styles.itemLinha}>
              <span>
                <strong>{item.nome}</strong><br />
                Venda: R$ {Number(item.precoVenda ?? item.preco ?? 0).toFixed(2)} | Custo: R$ {Number(item.precoCusto ?? 0).toFixed(2)}
              </span>

              <span>
                <button onClick={() => editarItemCardapio(item)} style={styles.repor}>Editar</button>
                <button onClick={() => alternarAtivoItemCardapio(item)} style={styles.repor}>Desativar</button>
                <button onClick={() => excluirItemCardapio(item)} style={styles.repor}>Excluir</button>
              </span>
            </div>
          ))}
        </div>
      ))}
    </>
  )}
</div>

<div style={styles.card}>
  <h2>Relatório por Data</h2>
  <input 
     type="date" 
     value={dataRelatorio} 
     onChange={e => setDataRelatorio(e.target.value)} 
     style={styles.input}
/>
        
        <button onClick={registrarEstoqueInicialDia} style={styles.yellow}>
📌 Registrar Estoque Inicial do Dia
</button>
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
        <h3>Faturamento clientes: R$ {rel.totalVendas.toFixed(2)}</h3>
        <h3>Consumo interno a custo: R$ {rel.totalConsumoInterno.toFixed(2)}</h3>
        <h3>Total a repassar: R$ {rel.totalRepasseInterno.toFixed(2)}</h3>
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