import React, { useEffect, useState } from 'react'
import { db } from './firebase'
import LoginScreen from './components/LoginScreen'
import HeaderBar from './components/HeaderBar'
import PainelCardapioComanda from './components/PainelCardapioComanda'
import ItensComandaPanel from './components/ItensComandaPanel'
import EstoqueProfissional from './components/EstoqueProfissional'
import styles from './styles/styles'

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
  where,
  runTransaction
} from 'firebase/firestore'

const cardapioPadrao = {
  Espetos: [
    { nome: 'Fraldinha', preco: 12.90, precoCusto: 5.19 },
    { nome: 'Costela', preco: 12.90, precoCusto: 5.19 },
    { nome: 'Franbacon', preco: 12.90, precoCusto: 4.00 },
    { nome: 'Linguiça Pernil', preco: 12.90, precoCusto: 4.00 },
    { nome: 'Panceta', preco: 12.90, precoCusto: 0 },
    { nome: 'Tulipa', preco: 12.90, precoCusto: 0 },
    { nome: 'Coração', preco: 12.90, precoCusto: 5.00 },
    { nome: 'Kafta', preco: 12.90, precoCusto: 5.00 },
    { nome: 'Pão de Alho', preco: 12.90, precoCusto: 2.80 },
    { nome: 'Queijo Coalho', preco: 12.90, precoCusto: 3.14 }
  ],

  'Espetos Premium Avulso': [
    { nome: 'Medalhão de Carne', preco: 14.90, precoCusto: 8.00, premium: true },
    { nome: 'Medalhão de Frango', preco: 14.90, precoCusto: 7.00, premium: true },
    { nome: 'Linguiça Cuiabana', preco: 14.90, precoCusto: 6.00, premium: true },
    { nome: 'Medalhão de Mandioca', preco: 14.90, precoCusto: 5.50, premium: true },
    { nome: 'Medalhão de Abobrinha', preco: 14.90, precoCusto: 5.50, premium: true },
    { nome: 'Misto', preco: 14.90, precoCusto: 6.00, premium: true },
    { nome: 'Abacaxi com Canela', preco: 14.90, precoCusto: 4.00, premium: true },
    { nome: 'Romeu e Julieta', preco: 14.90, precoCusto: 4.14, premium: true }
  ],

  Executivos: [
    { nome: 'Essencial', preco: 25.90, qtdEspetos: 1 },
    { nome: 'Tradicional', preco: 34.90, qtdEspetos: 2 },
    { nome: 'Mestre', preco: 41.90, qtdEspetos: 3 }
  ],

  Adicionais: [
    { nome: 'Adicional Baião de Dois', preco: 4.00, precoCusto: 0, controlaEstoque: false }
  ],

  Porções: [
    { nome: 'Batata Frita 500g', preco: 29.90, precoCusto: 0 },
    { nome: 'Batata Cheddar e Bacon 600g', preco: 35.90, precoCusto: 0 },
    { nome: 'Batata Mestre 700g', preco: 45.90, precoCusto: 0 }
  ],

  'Lanche no Espeto': [
    { nome: 'Lanche no Espeto', preco: 23.90, precoCusto: 0 }
  ],

  Bebidas: [
    { nome: 'Chopp Brahma 350ml', preco: 13.00, precoCusto: 0 },

    { nome: 'Original 300ml', preco: 7.00, precoCusto: 3.30 },
    { nome: 'Brahma 300ml', preco: 6.00, precoCusto: 2.63 },
    { nome: 'Skol 300ml', preco: 6.00, precoCusto: 2.63 },
    { nome: 'Combo 3 Cervejas 300ml', preco: 15.00, precoCusto: 0 },

    { nome: 'Brahma 600ml', preco: 14.00, precoCusto: 0 },
    { nome: 'Skol 600ml', preco: 14.00, precoCusto: 0 },
    { nome: 'Original 600ml', preco: 15.00, precoCusto: 8.19 },
    { nome: 'Spaten 600ml', preco: 16.00, precoCusto: 8.19 },

    { nome: 'Heineken Long Neck', preco: 16.00, precoCusto: 7.00 },
    { nome: 'Heineken 0.0', preco: 16.00, precoCusto: 7.00 },
    { nome: 'Amstel Ultra', preco: 16.00, precoCusto: 7.00 },

    { nome: 'Coca-Cola 350ml', preco: 7.00, precoCusto: 3.30 },
    { nome: 'Coca-Cola Zero 350ml', preco: 7.00, precoCusto: 3.30 },
    { nome: 'Guaraná Antarctica 350ml', preco: 7.00, precoCusto: 3.01 },
    { nome: 'Guaraná Zero 350ml', preco: 7.00, precoCusto: 3.00 },
    { nome: 'Fanta Laranja 350ml', preco: 7.00, precoCusto: 3.30 },
    { nome: 'H2O Limoneto', preco: 9.00, precoCusto: 4.09 },

    { nome: 'Coca-Cola 1L', preco: 13.00, precoCusto: 7.40 },
    { nome: 'Coca-Cola Zero 1L', preco: 13.00, precoCusto: 7.40 },
    { nome: 'Guaraná 1L', preco: 13.00, precoCusto: 4.27 },
    { nome: 'Guaraná Zero 1L', preco: 13.00, precoCusto: 4.27 },

    { nome: 'Água sem Gás 500ml', preco: 5.00, precoCusto: 0.69 },
    { nome: 'Água com Gás 500ml', preco: 5.50, precoCusto: 1.20 },

    { nome: 'Suco Natural Laranja 400ml', preco: 12.00, precoCusto: 0 },
    { nome: 'Suco Kapo Laranja', preco: 6.00, precoCusto: 2.65 },
    { nome: 'Suco Kapo Uva', preco: 6.00, precoCusto: 2.65 }
  ],

  Combos: [
    { nome: 'Happy Mestre', preco: 34.90, precoCusto: 0 },
    { nome: 'Almoço Mestre', preco: 42.90, precoCusto: 0 },
    { nome: 'Família Mestre', preco: 149.90, precoCusto: 0 }
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

const formatarDataBR = (dataISO) => {
  const [ano, mes, dia] = String(dataISO || '').split('-')
  if (!ano || !mes || !dia) return dataISO || ''
  return `${dia}/${mes}/${ano}`
}

const formatarMoedaBR = (valor) => {
  const numero = Number(valor || 0)
  const normalizado = Math.abs(numero) < 0.005 ? 0 : numero
  return normalizado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const custosPadrao = {
  'Fraldinha': 5.19,
  'Costela': 5.19,
  'Franbacon': 4,
  'Linguiça Pernil': 4,
  'Coração': 5,
  'Kafta': 5,
  'Pão de Alho': 2.8,
  'Queijo Coalho': 3.14,
  'Medalhão de Carne': 8,
  'Medalhão de Frango': 7,
  'Linguiça Cuiabana': 6,
  'Medalhão de Mandioca': 5.5,
  'Medalhão de Abobrinha': 5.5,
  'Misto': 6,
  'Abacaxi com Canela': 4,
  'Romeu e Julieta': 4.14,
  'Original 300ml': 3.3,
  'Brahma 300ml': 2.63,
  'Skol 300ml': 2.63,
  'Original 600ml': 8.19,
  'Spaten 600ml': 8.19,
  'Heineken Long Neck': 7,
  'Heineken 0.0': 7,
  'Amstel Ultra': 7,
  'Coca-Cola 350ml': 3.3,
  'Coca-Cola Zero 350ml': 3.3,
  'Guaraná Antarctica 350ml': 3.01,
  'Guaraná Zero 350ml': 3,
  'Fanta Laranja 350ml': 3.3,
  'H2O Limoneto': 4.09,
  'Coca-Cola 1L': 7.4,
  'Coca-Cola Zero 1L': 7.4,
  'Guaraná 1L': 4.27,
  'Guaraná Zero 1L': 4.27,
  'Água sem Gás 500ml': 0.69,
  'Água com Gás 500ml': 1.2,
  'Suco Kapo Laranja': 2.65,
  'Suco Kapo Uva': 2.65
}

const montarItensPadraoCardapio = () => {
  const itens = []

  Object.keys(cardapioPadrao).forEach(categoria => {
    cardapioPadrao[categoria].forEach(item => {
      itens.push({
        ...item,
        categoria,
        precoVenda: item.preco,
        precoCusto: Number(item.precoCusto ?? custosPadrao[item.nome] ?? 0),
        controlaEstoque: item.controlaEstoque !== false,
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
  // Sprint 1.2H-B — monitor do Agente Windows
  const [agenteImpressaoStatus, setAgenteImpressaoStatus] = useState({
    online: false,
    computador: '',
    impressora: '',
    atualizadoEmISO: ''
  })

  useEffect(() => {
    const refAgente = doc(db, 'statusSistema', 'agenteImpressao')

    const atualizar = dados => {
      const iso = dados?.atualizadoEmISO || ''
      const idadeMs = iso ? Date.now() - new Date(iso).getTime() : Infinity
      setAgenteImpressaoStatus({
        online: Boolean(dados?.online) && idadeMs <= 30000,
        computador: dados?.computador || '',
        impressora: dados?.impressora || '',
        atualizadoEmISO: iso
      })
    }

    const unsubscribeAgente = onSnapshot(
      refAgente,
      snap => atualizar(snap.exists() ? snap.data() : null),
      () => atualizar(null)
    )

    // Mesmo sem mudança no Firebase, reavalia a idade do heartbeat.
    const timerAgente = setInterval(() => {
      setAgenteImpressaoStatus(anterior => {
        const idadeMs = anterior.atualizadoEmISO
          ? Date.now() - new Date(anterior.atualizadoEmISO).getTime()
          : Infinity
        return { ...anterior, online: idadeMs <= 30000 }
      })
    }, 5000)

    return () => {
      try { unsubscribeAgente() } catch {}
      clearInterval(timerAgente)
    }
  }, [])

  const [loading, setLoading] = useState(true)
  const [comandas, setComandas] = useState([])
  const [historico, setHistorico] = useState([])
  const [comandaAtual, setComandaAtual] = useState(null)
  const [cliente, setCliente] = useState('')
  const [tipoComanda, setTipoComanda] = useState('Cliente')
  const [motivo, setMotivo] = useState('')
  const [atendente, setAtendente] = useState(localStorage.getItem('atendente_mestre') || '')
  const [pagamento, setPagamento] = useState('dinheiro')
  const [mostrarFechamentoCaixa, setMostrarFechamentoCaixa] = useState(false)
  const [valorRecebido, setValorRecebido] = useState('')
  const [fechandoComanda, setFechandoComanda] = useState(false)
  const [caixaDia, setCaixaDia] = useState(null)
  const [movimentosCaixa, setMovimentosCaixa] = useState([])
  const [mostrarGestaoCaixa, setMostrarGestaoCaixa] = useState(false)
  const [valorMovimentoCaixa, setValorMovimentoCaixa] = useState('')
  const [motivoMovimentoCaixa, setMotivoMovimentoCaixa] = useState('')
  const [valorContadoCaixa, setValorContadoCaixa] = useState('')
  const [historicoCaixas, setHistoricoCaixas] = useState([])
  const [dataHistoricoCaixa, setDataHistoricoCaixa] = useState(hoje())
  const [mostrarDashboardGerencial, setMostrarDashboardGerencial] = useState(false)
  const [estoque, setEstoque] = useState(estoqueInicial)
  const [estoqueInicialDia, setEstoqueInicialDia] = useState({})
  const [busca, setBusca] = useState('')
  const [dataRelatorio, setDataRelatorio] = useState(hoje())
  const [executivoSelecionado, setExecutivoSelecionado] = useState(null)
  const [espetosExecutivo, setEspetosExecutivo] = useState([])
  const [baiaoExecutivo, setBaiaoExecutivo] = useState(false)
  const [observacaoExecutivo, setObservacaoExecutivo] = useState('')
  const [observacaoCombo, setObservacaoCombo] = useState('')
  const [observacaoLanche, setObservacaoLanche] = useState('')
  const [comboSelecionado, setComboSelecionado] = useState(null)
  const [espetosCombo, setEspetosCombo] = useState([])
  const [upgradeBatataCombo, setUpgradeBatataCombo] = useState(false)
  const [refrigeranteFamilia, setRefrigeranteFamilia] = useState('Coca-Cola 1L')
  const [lancheSelecionado, setLancheSelecionado] = useState(null)
  const [espetoLanche, setEspetoLanche] = useState(null)
  const [cardapio, setCardapio] = useState(cardapioPadrao)
  const [itensCardapio, setItensCardapio] = useState([])
  const [pedidosCozinha, setPedidosCozinha] = useState([])
  const [mostrarFilaCozinha, setMostrarFilaCozinha] = useState(false)
  const [enviandoCozinha, setEnviandoCozinha] = useState(false)
  // Impressão automática oficial: Agente Windows.
  // O navegador fica sempre fora da fila para não "roubar" pedidos do agente.
  const [postoImpressaoAtivo, setPostoImpressaoAtivo] = useState(false)
  const [pedidoEmImpressao, setPedidoEmImpressao] = useState(null)
  const [ultimaSincronizacaoCozinha, setUltimaSincronizacaoCozinha] = useState(null)
  const [agoraCozinha, setAgoraCozinha] = useState(Date.now())
  const [alertasPedidosProntos, setAlertasPedidosProntos] = useState([])
  const [audioAlertasLiberado, setAudioAlertasLiberado] = useState(
    localStorage.getItem('mestre_audio_alertas') === '1'
  )

  const [mostrarGestaoCardapio, setMostrarGestaoCardapio] = useState(false)
  const [mostrarEstoque, setMostrarEstoque] = useState(false)
  const [usuarioEntrou, setUsuarioEntrou] = useState(false)
  const [adminLiberado, setAdminLiberado] = useState(false)
  const [nomeEntrada, setNomeEntrada] = useState('')

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setAgoraCozinha(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('atendente_mestre', atendente)
  }, [atendente])

  useEffect(() => {
    // Migração: versões antigas podiam deixar o navegador como posto de impressão.
    // Nesta versão somente o Agente Windows deve consumir statusImpressao='aguardando'.
    localStorage.setItem('mestre_posto_impressao', '0')
    setPostoImpressaoAtivo(false)

    const recuperarPedidosPresos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pedidosCozinha'))
        const agora = Date.now()

        const presos = snapshot.docs.filter(d => {
          const p = d.data()
          if (p.statusImpressao !== 'imprimindo' || p.status === 'entregue') return false

          const ts = p.impressaoIniciadaEm
          let inicio = 0

          if (ts?.toDate) inicio = ts.toDate().getTime()
          else if (ts?.seconds) inicio = Number(ts.seconds) * 1000
          else if (p.criadoEmISO) inicio = new Date(p.criadoEmISO).getTime()

          // Só recupera impressões presas há mais de 2 minutos.
          return !inicio || (agora - inicio) > 120000
        })

        await Promise.all(
          presos.map(d =>
            updateDoc(doc(db, 'pedidosCozinha', d.id), {
              statusImpressao: 'aguardando'
            })
          )
        )

        if (presos.length) {
          console.log(`Impressão: ${presos.length} pedido(s) preso(s) devolvido(s) para aguardando.`)
        }
      } catch (error) {
        console.error('Falha ao recuperar fila de impressão:', error)
      }
    }

    recuperarPedidosPresos()
  }, [])

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
    const data = hoje()

    const unsubCaixa = onSnapshot(doc(db, 'caixas', data), snap => {
      setCaixaDia(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })

    const unsubMovimentos = onSnapshot(collection(db, 'movimentosCaixa'), snapshot => {
      const lista = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.data === data)
        .sort((a, b) => String(a.criadoEmISO || '').localeCompare(String(b.criadoEmISO || '')))
      setMovimentosCaixa(lista)
    })

    return () => {
      unsubCaixa()
      unsubMovimentos()
    }
  }, [])

  useEffect(() => {
    const unsubHistoricoCaixas = onSnapshot(collection(db, 'caixas'), snapshot => {
      const lista = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => String(b.data || b.id || '').localeCompare(String(a.data || a.id || '')))
      setHistoricoCaixas(lista)
    })

    return () => unsubHistoricoCaixas()
  }, [])

  useEffect(() => {
    if (!comandaAtual) return
    const atual = comandas.find(c => c.id === comandaAtual.id)
    if (atual) setComandaAtual(atual)
  }, [comandas])

  useEffect(() => {
    setMostrarFechamentoCaixa(false)
    setValorRecebido('')
  }, [comandaAtual?.id])

  useEffect(() => {
    const ref = doc(db, 'estoquesIniciais', dataRelatorio)

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setEstoqueInicialDia(snap.data())
      else setEstoqueInicialDia({})
    })

    return () => unsub()
  }, [dataRelatorio])

  useEffect(() => {
    const unsubCardapio = onSnapshot(collection(db, 'cardapio'), snapshot => {
      if (snapshot.empty) {
        setItensCardapio([])
        setCardapio({})
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

  useEffect(() => {
    const ordenarFila = docs => docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.dataPedido === hoje() && p.status !== 'entregue')
      .sort((a, b) => Number(a.numero || 0) - Number(b.numero || 0))

    const aplicarFila = lista => {
      setPedidosCozinha(lista)
      setUltimaSincronizacaoCozinha(new Date())
    }

    // Canal principal: atualização em tempo real do Firestore.
    const unsubPedidos = onSnapshot(
      collection(db, 'pedidosCozinha'),
      snapshot => {
        aplicarFila(ordenarFila(snapshot.docs))
      },
      error => {
        console.error('Listener da cozinha perdeu conexão:', error)
      }
    )

    // Canal de contingência: consulta periódica.
    // Isso cobre casos em que o navegador/rede deixa o listener parado sem avisar.
    const atualizarPorConsulta = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pedidosCozinha'))
        aplicarFila(ordenarFila(snapshot.docs))
      } catch (error) {
        console.error('Falha na consulta de contingência da cozinha:', error)
      }
    }

    const intervalo = setInterval(() => {
      if (postoImpressaoAtivo) atualizarPorConsulta()
    }, 3000)

    const aoFicarOnline = () => atualizarPorConsulta()
    const aoVoltarParaAba = () => {
      if (document.visibilityState === 'visible') atualizarPorConsulta()
    }

    window.addEventListener('online', aoFicarOnline)
    document.addEventListener('visibilitychange', aoVoltarParaAba)

    // Primeira conferência imediatamente.
    atualizarPorConsulta()

    return () => {
      unsubPedidos()
      clearInterval(intervalo)
      window.removeEventListener('online', aoFicarOnline)
      document.removeEventListener('visibilitychange', aoVoltarParaAba)
    }
  }, [postoImpressaoAtivo])

  useEffect(() => {
    if (!usuarioEntrou || pedidosCozinha.length === 0) return

    const chaveVistos = `mestre_pedidos_prontos_vistos_${hoje()}`
    let vistos = []

    try {
      vistos = JSON.parse(localStorage.getItem(chaveVistos) || '[]')
      if (!Array.isArray(vistos)) vistos = []
    } catch (e) {
      vistos = []
    }

    const pedidosProntosNovos = pedidosCozinha.filter(p =>
      p.status === 'pronto' && !vistos.includes(p.id)
    )

    if (pedidosProntosNovos.length === 0) return

    setAlertasPedidosProntos(prev => {
      const idsAtuais = new Set(prev.map(a => a.id))
      const novos = pedidosProntosNovos.filter(p => !idsAtuais.has(p.id))
      return [...prev, ...novos]
    })

    const novosVistos = [...new Set([...vistos, ...pedidosProntosNovos.map(p => p.id)])]
    localStorage.setItem(chaveVistos, JSON.stringify(novosVistos))

    if (audioAlertasLiberado) {
      pedidosProntosNovos.forEach((pedido, index) => {
        setTimeout(() => {
          const tocarFalaPedidoPronto = () => {
            try {
              const fala = new Audio('/pedido-pronto.mp3')
              fala.volume = 1
              fala.play().catch(() => {
                try {
                  const fallback = new Audio('/alerta.mp3')
                  fallback.volume = 1
                  fallback.play().catch(() => {})
                } catch (e) {}
              })
            } catch (e) {}
          }

          try {
            const sino = new Audio('/campainha.mp3')
            sino.volume = 1
            sino.currentTime = 0

            sino.play()
              .then(() => {
                let falaIniciada = false

                const iniciarFala = () => {
                  if (falaIniciada) return
                  falaIniciada = true
                  sino.removeEventListener('ended', iniciarFala)
                  setTimeout(tocarFalaPedidoPronto, 180)
                }

                sino.addEventListener('ended', iniciarFala)

                setTimeout(() => {
                  if (falaIniciada) return
                  sino.pause()
                  sino.currentTime = 0
                  iniciarFala()
                }, 2200)
              })
              .catch(() => tocarFalaPedidoPronto())
          } catch (e) {
            tocarFalaPedidoPronto()
          }
        }, index * 3000)
      })
    }
  }, [pedidosCozinha, usuarioEntrou, audioAlertasLiberado])

  const ativarAudioAlertas = async () => {
    try {
      const audio = new Audio('/alerta.mp3')
      audio.volume = 0.9
      await audio.play()
      setAudioAlertasLiberado(true)
      localStorage.setItem('mestre_audio_alertas', '1')
      alert('🔔 Som dos pedidos prontos ativado neste aparelho.')
    } catch (error) {
      alert('O navegador bloqueou o som. Toque novamente em ativar som e verifique se o aparelho não está no silencioso.')
    }
  }

  const dispensarAlertaPedidoPronto = pedidoId => {
    setAlertasPedidosProntos(prev => prev.filter(p => p.id !== pedidoId))
  }


  const entrarNoSistema = () => {
    const nome = nomeEntrada.trim()

    if (nome.length < 3) {
      return alert('Digite seu nome com pelo menos 3 caracteres.')
    }

    setAtendente(nome)
    localStorage.setItem('atendente_mestre', nome)
    setUsuarioEntrou(true)
  }

  const trocarAtendente = () => {
    setAdminLiberado(false)
    setUsuarioEntrou(false)
    setComandaAtual(null)
    setNomeEntrada('')
    setAtendente('')
    localStorage.removeItem('atendente_mestre')
  }

  const liberarAdministrador = () => {
    const senha = prompt('Digite a senha do administrador:')

    if (senha === '365608') {
      setAdminLiberado(true)
      alert('Área administrativa liberada.')
    } else if (senha !== null) {
      alert('Senha incorreta.')
    }
  }

  const bloquearAdministrador = () => {
    setAdminLiberado(false)
    setMostrarGestaoCardapio(false)
    setMostrarEstoque(false)
  }

  const tocarSom = (arquivo) => {
    try { new Audio(arquivo).play() } catch (e) {}
  }

  const criarIdItemCozinha = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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

    if (item.tipo === 'executivo' || item.tipo === 'combo' || item.tipo === 'lanche') {
      const listaEspetos = item.detalhesEspetos && item.detalhesEspetos.length
        ? item.detalhesEspetos.map(e => e.nome)
        : (item.espetosInclusos || [])

      listaEspetos.forEach(nomeEspeto => {
        const detalheEspeto = (item.detalhesEspetos || []).find(e => e.nome === nomeEspeto)
        const custo = Number(detalheEspeto?.precoCusto ?? custoProduto(nomeEspeto) ?? 0)
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

      if (item.tipo === 'combo') {
        ;(item.componentesInclusos || []).forEach(comp => {
          const qtd = Number(comp.qtd || 1)
          const custoComp = Number(comp.precoCusto ?? custoProduto(comp.nome) ?? 0)
          totalCusto += custoComp * qtd

          if (tipo === 'Família' || tipo === 'Sócios') {
            totalRepasse += custoComp * qtd
          }
        })
      }


      return
    }

    const nomeEstoque = item.estoqueNome || item.nome
    const custo = Number(item.precoCusto ?? custoProduto(nomeEstoque) ?? 0)
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

  const vendasDinheiroHoje = historico
    .filter(h => h.dataFechamento === hoje() && (h.tipoComanda || 'Cliente') === 'Cliente' && h.pagamento === 'dinheiro')
    .reduce((acc, h) => acc + Number(h.total || 0), 0)

  const totalSuprimentosHoje = movimentosCaixa
    .filter(m => m.tipo === 'suprimento')
    .reduce((acc, m) => acc + Number(m.valor || 0), 0)

  const totalSangriasHoje = movimentosCaixa
    .filter(m => m.tipo === 'sangria')
    .reduce((acc, m) => acc + Number(m.valor || 0), 0)

  const valorEsperadoCaixa = Number(caixaDia?.valorAbertura || 0) + vendasDinheiroHoje + totalSuprimentosHoje - totalSangriasHoje

  const abrirCaixaDia = async () => {
    if (caixaDia?.status === 'aberto') return alert('O caixa de hoje já está aberto.')
    if (caixaDia?.status === 'fechado') return alert('O caixa de hoje já foi fechado.')

    const entrada = prompt('Valor inicial para troco no caixa:\nEx.: 100,00')
    if (entrada === null) return
    const valor = Number(String(entrada).replace(',', '.'))
    if (!Number.isFinite(valor) || valor < 0) return alert('Digite um valor válido para abertura.')

    await setDoc(doc(db, 'caixas', hoje()), {
      data: hoje(), status: 'aberto', valorAbertura: valor,
      abertoPor: atendente || 'Não informado',
      abertoEmISO: new Date().toISOString(), abertoEm: serverTimestamp()
    })
    setMostrarGestaoCaixa(true)
    alert(`✅ Caixa aberto com R$ ${formatarMoedaBR(valor)}.`)
  }

  const registrarMovimentoCaixa = async tipo => {
    if (caixaDia?.status !== 'aberto') return alert('Abra o caixa antes de registrar movimentações.')
    const valor = Number(String(valorMovimentoCaixa || '').replace(',', '.'))
    if (!Number.isFinite(valor) || valor <= 0) return alert('Digite um valor maior que zero.')
    if (!motivoMovimentoCaixa.trim()) return alert('Informe o motivo da movimentação.')
    if (tipo === 'sangria' && valor > valorEsperadoCaixa) {
      return alert(`Sangria maior que o valor esperado em caixa.\nEsperado: R$ ${formatarMoedaBR(valorEsperadoCaixa)}`)
    }

    await addDoc(collection(db, 'movimentosCaixa'), {
      data: hoje(), tipo, valor, motivo: motivoMovimentoCaixa.trim(),
      responsavel: atendente || 'Não informado',
      criadoEmISO: new Date().toISOString(), criadoEm: serverTimestamp()
    })
    setValorMovimentoCaixa('')
    setMotivoMovimentoCaixa('')
    alert(tipo === 'suprimento' ? '✅ Suprimento registrado.' : '✅ Sangria registrada.')
  }

  const fecharCaixaDia = async () => {
    if (caixaDia?.status !== 'aberto') return alert('Não há caixa aberto para fechar.')
    const contado = Number(String(valorContadoCaixa || '').replace(',', '.'))
    if (!Number.isFinite(contado) || contado < 0) return alert('Informe o valor contado fisicamente no caixa.')
    const diferenca = contado - valorEsperadoCaixa
    const texto = diferenca === 0 ? 'Caixa conferido sem diferença.' : diferenca > 0 ? `Sobra de R$ ${formatarMoedaBR(diferenca)}` : `Falta de R$ ${formatarMoedaBR(Math.abs(diferenca))}`

    if (!confirm(`FECHAR CAIXA?\n\nAbertura: R$ ${formatarMoedaBR(caixaDia.valorAbertura)}\nVendas em dinheiro: R$ ${formatarMoedaBR(vendasDinheiroHoje)}\nSuprimentos: R$ ${formatarMoedaBR(totalSuprimentosHoje)}\nSangrias: R$ ${formatarMoedaBR(totalSangriasHoje)}\nEsperado: R$ ${formatarMoedaBR(valorEsperadoCaixa)}\nContado: R$ ${formatarMoedaBR(contado)}\n\n${texto}`)) return

    const vendasClientesHoje = historico.filter(h =>
      h.dataFechamento === hoje() &&
      (h.tipoComanda || 'Cliente') === 'Cliente'
    )
    const vendasPixHoje = vendasClientesHoje
      .filter(h => h.pagamento === 'pix')
      .reduce((acc, h) => acc + Number(h.total || 0), 0)
    const vendasCartaoHoje = vendasClientesHoje
      .filter(h => h.pagamento === 'cartao')
      .reduce((acc, h) => acc + Number(h.total || 0), 0)
    const faturamentoClientesHoje = vendasDinheiroHoje + vendasPixHoje + vendasCartaoHoje

    await setDoc(doc(db, 'caixas', hoje()), {
      vendasDinheiro: vendasDinheiroHoje,
      vendasPix: vendasPixHoje,
      vendasCartao: vendasCartaoHoje,
      faturamentoClientes: faturamentoClientesHoje,
      totalSuprimentos: totalSuprimentosHoje,
      totalSangrias: totalSangriasHoje,
      valorEsperado: valorEsperadoCaixa,
      valorContado: contado,
      diferenca,
      status: 'fechado',
      fechadoPor: atendente || 'Não informado',
      fechadoEmISO: new Date().toISOString(),
      fechadoEm: serverTimestamp()
    }, { merge: true })
    setValorContadoCaixa('')
    alert(`🔒 Caixa fechado.\n${texto}`)
  }

  const caixaHistoricoSelecionado = historicoCaixas.find(c =>
    (c.data || c.id) === dataHistoricoCaixa
  ) || null

  const vendasHistoricoSelecionado = historico.filter(h =>
    h.dataFechamento === dataHistoricoCaixa &&
    (h.tipoComanda || 'Cliente') === 'Cliente'
  )

  const dinheiroHistoricoSelecionado = Number(
    caixaHistoricoSelecionado?.vendasDinheiro ??
    vendasHistoricoSelecionado
      .filter(h => h.pagamento === 'dinheiro')
      .reduce((acc, h) => acc + Number(h.total || 0), 0)
  )

  const pixHistoricoSelecionado = Number(
    caixaHistoricoSelecionado?.vendasPix ??
    vendasHistoricoSelecionado
      .filter(h => h.pagamento === 'pix')
      .reduce((acc, h) => acc + Number(h.total || 0), 0)
  )

  const cartaoHistoricoSelecionado = Number(
    caixaHistoricoSelecionado?.vendasCartao ??
    vendasHistoricoSelecionado
      .filter(h => h.pagamento === 'cartao')
      .reduce((acc, h) => acc + Number(h.total || 0), 0)
  )

  const faturamentoHistoricoSelecionado = Number(
    caixaHistoricoSelecionado?.faturamentoClientes ??
    (dinheiroHistoricoSelecionado + pixHistoricoSelecionado + cartaoHistoricoSelecionado)
  )

  const limparCaixaTesteDia = async () => {
    const data = hoje()

    const primeiraConfirmacao = confirm(
      `ATENÇÃO — LIMPAR CAIXA DE TESTE\n\n` +
      `Data: ${formatarDataBR(data)}\n\n` +
      `Isso apagará SOMENTE:\n` +
      `• abertura/fechamento do caixa do dia;\n` +
      `• suprimentos do dia;\n` +
      `• sangrias do dia.\n\n` +
      `NÃO apagará vendas, comandas, histórico de vendas ou estoque.\n\n` +
      `Deseja continuar?`
    )

    if (!primeiraConfirmacao) return

    const confirmacaoFinal = prompt(
      'Para confirmar, digite exatamente: LIMPAR'
    )

    if (confirmacaoFinal !== 'LIMPAR') {
      return alert('Limpeza cancelada.')
    }

    try {
      const movimentosSnapshot = await getDocs(
        query(
          collection(db, 'movimentosCaixa'),
          where('data', '==', data)
        )
      )

      const exclusoes = movimentosSnapshot.docs.map(item =>
        deleteDoc(doc(db, 'movimentosCaixa', item.id))
      )

      await Promise.all(exclusoes)
      await deleteDoc(doc(db, 'caixas', data))

      setCaixaDia(null)
      setMovimentosCaixa([])
      setValorMovimentoCaixa('')
      setMotivoMovimentoCaixa('')
      setValorContadoCaixa('')

      alert(
        `🧹 Caixa de teste de ${formatarDataBR(data)} limpo com sucesso.\n\n` +
        `As vendas e comandas foram preservadas.`
      )
    } catch (error) {
      console.error('Erro ao limpar caixa de teste:', error)
      alert('Não foi possível limpar o caixa de teste. Tente novamente.')
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
    const tipoComandaSalvo = adminLiberado ? tipoComanda : 'Cliente'

    const nova = {
      cliente: cliente.trim(),
      tipoComanda: tipoComandaSalvo,
      motivo: adminLiberado ? motivo.trim() : '',
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

    let precoFinal = Number(item.preco ?? 0)
    let observacaoCombo = ''

    if (item.nome === 'Família Mestre') {
      const upgrade = confirm(
        'Combo Família Mestre\n\nDeseja upgrade para Batata Mestre por + R$ 10,00?'
      )
      if (upgrade) {
        precoFinal += 10
        observacaoCombo = 'Upgrade Batata Mestre + R$ 10,00'
      }
    }

    const observacaoItem = prompt(
      `Observação opcional para ${item.nome}:\nEx.: sem gelo, sem açúcar, sem vinagrete, sem cebola...`
    ) || ''

    const itemVenda = {
      nome: item.nome,
      preco: precoFinal,
      precoCusto: Number(item.precoCusto ?? custoProduto(nomeEstoque)),
      categoria,
      tipo: item.premiumExecutivo ? 'premium-executivo' : 'normal',
      estoqueNome: nomeEstoque,
      observacaoCombo,
      observacao: observacaoItem,
      cozinhaItemId: criarIdItemCozinha(),
      enviadoCozinha: false
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
    setBaiaoExecutivo(false)
    setObservacaoExecutivo('')

    setTimeout(() => {
      document.getElementById('selecao-executivo')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
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
        adicional: espeto.premium ? 5 : 0
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
    const adicionalBaiao = baiaoExecutivo ? 4 : 0
    const precoFinal = executivoSelecionado.preco + adicionalPremium + adicionalBaiao

    const itemVenda = {
      nome: executivoSelecionado.nome,
      preco: precoFinal,
      precoBase: executivoSelecionado.preco,
      adicionalPremium,
      adicionalBaiao,
      acompanhamento: baiaoExecutivo ? 'Baião de Dois' : 'Arroz Branco',
      categoria: 'Executivos',
      tipo: 'executivo',
      observacao: observacaoExecutivo.trim(),
      espetosInclusos: espetosExecutivo.map(e => e.nome),
      detalhesEspetos: espetosExecutivo,
      cozinhaItemId: criarIdItemCozinha(),
      enviadoCozinha: false
    }

    await salvarEstoque(novoEstoque)
    await atualizarComanda({
      ...comandaAtual,
      itens: [...(comandaAtual.itens || []), itemVenda]
    })

    setExecutivoSelecionado(null)
    setEspetosExecutivo([])
    setBaiaoExecutivo(false)
    setObservacaoExecutivo('')
  }

  const quantidadeEspetosCombo = (nomeCombo) => {
    if (nomeCombo === 'Happy Mestre') return 2
    if (nomeCombo === 'Almoço Mestre') return 2
    if (nomeCombo === 'Família Mestre') return 8
    return 0
  }

  const abrirSelecaoCombo = (item) => {
    if (!comandaAtual) return alert('Selecione ou crie uma comanda.')

    const qtd = quantidadeEspetosCombo(item.nome)
    if (!qtd) return adicionarItem(item, 'Combos')

    setComboSelecionado({ ...item, qtdEspetosCombo: qtd })
    setEspetosCombo([])
    setUpgradeBatataCombo(false)
    setRefrigeranteFamilia('Coca-Cola 1L')
    setObservacaoCombo('')

    setTimeout(() => {
      document.getElementById('selecao-combo')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const adicionarEspetoCombo = (espeto) => {
    if (!comboSelecionado) return

    if (espetosCombo.length >= comboSelecionado.qtdEspetosCombo) {
      return alert(`Este combo permite escolher ${comboSelecionado.qtdEspetosCombo} espetos tradicionais.`)
    }

    if ((estoque[espeto.nome] || 0) <= 0) {
      tocarSom('/alerta.mp3')
      return alert(`${espeto.nome} está sem estoque.`)
    }

    setEspetosCombo([...espetosCombo, {
      nome: espeto.nome,
      precoCusto: custoProduto(espeto.nome)
    }])
  }

  const removerEspetoCombo = (index) => {
    const nova = [...espetosCombo]
    nova.splice(index, 1)
    setEspetosCombo(nova)
  }

  const confirmarCombo = async () => {
    if (!comboSelecionado) return

    if (espetosCombo.length !== comboSelecionado.qtdEspetosCombo) {
      return alert(`Selecione exatamente ${comboSelecionado.qtdEspetosCombo} espetos tradicionais.`)
    }

    const componentesInclusos = []

    if (comboSelecionado.nome === 'Happy Mestre') {
      componentesInclusos.push({
        nome: 'Chopp Brahma 350ml',
        qtd: 1,
        precoCusto: custoProduto('Chopp Brahma 350ml')
      })
    }

    if (comboSelecionado.nome === 'Almoço Mestre') {
      componentesInclusos.push({
        nome: 'Suco Natural Laranja 400ml',
        qtd: 1,
        precoCusto: custoProduto('Suco Natural Laranja 400ml')
      })
    }

    if (comboSelecionado.nome === 'Família Mestre') {
      componentesInclusos.push({
        nome: upgradeBatataCombo ? 'Batata Mestre 700g' : 'Batata Cheddar e Bacon 600g',
        qtd: 1,
        precoCusto: custoProduto(
          upgradeBatataCombo ? 'Batata Mestre 700g' : 'Batata Cheddar e Bacon 600g'
        )
      })

      componentesInclusos.push({
        nome: refrigeranteFamilia,
        qtd: 1,
        precoCusto: custoProduto(refrigeranteFamilia)
      })
    }

    let novoEstoque = { ...estoque }

    for (const espeto of espetosCombo) {
      if ((novoEstoque[espeto.nome] || 0) <= 0) {
        tocarSom('/alerta.mp3')
        return alert(`${espeto.nome} está sem estoque.`)
      }
      novoEstoque[espeto.nome] -= 1
    }

    for (const componente of componentesInclusos) {
      const atual = Number(novoEstoque[componente.nome] || 0)
      if (atual < componente.qtd) {
        tocarSom('/alerta.mp3')
        return alert(`${componente.nome} está sem estoque suficiente para este combo.`)
      }
      novoEstoque[componente.nome] = atual - componente.qtd
    }

    const upgrade = comboSelecionado.nome === 'Família Mestre' && upgradeBatataCombo
    const precoFinal = Number(comboSelecionado.preco ?? 0) + (upgrade ? 10 : 0)

    const itemVenda = {
      nome: comboSelecionado.nome,
      preco: precoFinal,
      precoBase: Number(comboSelecionado.preco ?? 0),
      categoria: 'Combos',
      tipo: 'combo',
      espetosInclusos: espetosCombo.map(e => e.nome),
      detalhesEspetos: espetosCombo,
      componentesInclusos,
      observacaoCombo: upgrade ? 'Upgrade Batata Mestre + R$ 10,00' : '',
      observacao: observacaoCombo.trim(),
      cozinhaItemId: criarIdItemCozinha(),
      enviadoCozinha: false
    }

    await salvarEstoque(novoEstoque)
    await atualizarComanda({
      ...comandaAtual,
      itens: [...(comandaAtual.itens || []), itemVenda]
    })

    setComboSelecionado(null)
    setEspetosCombo([])
    setUpgradeBatataCombo(false)
    setRefrigeranteFamilia('Coca-Cola 1L')
    setObservacaoCombo('')
  }

  const abrirSelecaoLanche = (item) => {
    if (!comandaAtual) return alert('Selecione ou crie uma comanda.')

    setLancheSelecionado(item)
    setEspetoLanche(null)
    setObservacaoLanche('')

    setTimeout(() => {
      document.getElementById('selecao-lanche')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const selecionarEspetoLanche = (espeto) => {
    if ((estoque[espeto.nome] || 0) <= 0) {
      tocarSom('/alerta.mp3')
      return alert(`${espeto.nome} está sem estoque.`)
    }

    setEspetoLanche({
      nome: espeto.nome,
      precoCusto: custoProduto(espeto.nome)
    })
  }

  const confirmarLanche = async () => {
    if (!lancheSelecionado) return
    if (!espetoLanche) return alert('Escolha o espeto do lanche.')

    if ((estoque[espetoLanche.nome] || 0) <= 0) {
      tocarSom('/alerta.mp3')
      return alert(`${espetoLanche.nome} está sem estoque.`)
    }

    const novoEstoque = {
      ...estoque,
      [espetoLanche.nome]: (estoque[espetoLanche.nome] || 0) - 1
    }

    const itemVenda = {
      nome: lancheSelecionado.nome,
      preco: Number(lancheSelecionado.preco ?? 0),
      precoCusto: Number(espetoLanche.precoCusto ?? 0),
      categoria: 'Lanche no Espeto',
      tipo: 'lanche',
      espetoEscolhido: espetoLanche.nome,
      espetosInclusos: [espetoLanche.nome],
      observacao: observacaoLanche.trim(),
      cozinhaItemId: criarIdItemCozinha(),
      enviadoCozinha: false
    }

    await salvarEstoque(novoEstoque)
    await atualizarComanda({
      ...comandaAtual,
      itens: [...(comandaAtual.itens || []), itemVenda]
    })

    setLancheSelecionado(null)
    setEspetoLanche(null)
    setObservacaoLanche('')
  }

  const removerItem = async (index) => {
    const item = comandaAtual.itens[index]
    const novosItens = [...comandaAtual.itens]
    novosItens.splice(index, 1)

    let novoEstoque = { ...estoque }

    if (item.tipo === 'executivo' || item.tipo === 'combo' || item.tipo === 'lanche') {
      ;(item.espetosInclusos || []).forEach(e => {
        novoEstoque[e] = (novoEstoque[e] || 0) + 1
      })

      if (item.tipo === 'combo') {
        ;(item.componentesInclusos || []).forEach(comp => {
          novoEstoque[comp.nome] = (novoEstoque[comp.nome] || 0) + Number(comp.qtd || 1)
        })
      }
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

  const enviarParaCozinha = async () => {
    if (!comandaAtual) return alert('Selecione uma comanda.')
    if (enviandoCozinha) return

    setEnviandoCozinha(true)

    try {
      // Garante um identificador único e estável para cada item da comanda.
      let todosItens = (comandaAtual.itens || []).map(item => ({
        ...item,
        cozinhaItemId: item.cozinhaItemId || criarIdItemCozinha()
      }))

      const tinhaItemSemId = (comandaAtual.itens || []).some(item => !item.cozinhaItemId)

      if (tinhaItemSemId) {
        await updateDoc(doc(db, 'comandas', comandaAtual.id), {
          itens: todosItens
        })
      }

      // Usa o Firebase como fonte da verdade: verifica quais IDs dessa comanda
      // já apareceram em pedidos enviados hoje.
      const snapshotPedidos = await getDocs(collection(db, 'pedidosCozinha'))
      const idsJaEnviados = new Set()

      snapshotPedidos.docs.forEach(d => {
        const p = d.data()
        if (
          p.comandaId === comandaAtual.id &&
          p.dataPedido === hoje()
        ) {
          ;(p.itens || []).forEach(item => {
            if (item.cozinhaItemId) idsJaEnviados.add(item.cozinhaItemId)
          })
        }
      })

      const novosItens = todosItens.filter(item => !idsJaEnviados.has(item.cozinhaItemId))

      if (novosItens.length === 0) {
        return alert('Não há itens novos para enviar à cozinha.')
      }

      const sequenciaRef = doc(db, 'controle', 'sequenciaCozinha')
      const pedidoRef = doc(collection(db, 'pedidosCozinha'))
      let numeroGerado = 0

      await runTransaction(db, async transaction => {
        const sequenciaSnap = await transaction.get(sequenciaRef)
        const dadosSequencia = sequenciaSnap.exists() ? sequenciaSnap.data() : {}
        const dataAtual = hoje()

        const ultimoNumero = dadosSequencia.data === dataAtual
          ? Number(dadosSequencia.ultimoNumero || 0)
          : 0

        numeroGerado = ultimoNumero + 1

        transaction.set(sequenciaRef, {
          data: dataAtual,
          ultimoNumero: numeroGerado,
          atualizadoEm: serverTimestamp()
        })

        transaction.set(pedidoRef, {
          numero: numeroGerado,
          dataPedido: dataAtual,
          comandaId: comandaAtual.id,
          cliente: comandaAtual.cliente || '',
          atendente: comandaAtual.atendente || atendente || '',
          itens: novosItens,
          // Sprint 1.2H-A: pedido enviado já entra em preparo.
          status: 'preparo',
          statusAtualizadoEm: serverTimestamp(),
          statusImpressao: 'aguardando',
          criadoEmISO: new Date().toISOString(),
          criadoEm: serverTimestamp()
        })

        const idsNovoPedido = new Set(novosItens.map(item => item.cozinhaItemId))
        const itensMarcados = todosItens.map(item =>
          idsNovoPedido.has(item.cozinhaItemId)
            ? {
                ...item,
                enviadoCozinha: true,
                pedidoCozinhaNumero: numeroGerado
              }
            : item
        )

        transaction.update(doc(db, 'comandas', comandaAtual.id), {
          itens: itensMarcados,
          itensEnviadosCozinha: itensMarcados.filter(item => item.enviadoCozinha === true).length,
          ultimoPedidoCozinha: numeroGerado
        })
      })

      alert(
        `Pedido nº ${String(numeroGerado).padStart(4, '0')} enviado para a cozinha!\n` +
        `${novosItens.length} item(ns) novo(s).`
      )
      setMostrarFilaCozinha(true)
    } catch (error) {
      console.error('Erro ao enviar pedido para cozinha:', error)
      alert('Não foi possível enviar o pedido para a cozinha. Tente novamente.')
    } finally {
      setEnviandoCozinha(false)
    }
  }

  const atualizarStatusPedidoCozinha = async (pedido, novoStatus) => {
    try {
      await updateDoc(doc(db, 'pedidosCozinha', pedido.id), {
        status: novoStatus,
        statusAtualizadoEm: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao atualizar pedido da cozinha:', error)
      alert('Não foi possível atualizar o status do pedido.')
    }
  }

  const rotuloStatusCozinha = status => {
    if (status === 'preparo') return '🔥 Em preparo'
    if (status === 'pronto') return '🟢 Pronto'
    if (status === 'entregue') return '✅ Entregue'
    return '🟡 Novo'
  }

  const minutosDesdePedido = pedido => {
    if (!pedido?.criadoEmISO) return 0
    const inicio = new Date(pedido.criadoEmISO).getTime()
    if (!Number.isFinite(inicio)) return 0
    return Math.max(0, Math.floor((agoraCozinha - inicio) / 60000))
  }

  const nivelTempoPedido = pedido => {
    const minutos = minutosDesdePedido(pedido)
    if (pedido.status === 'pronto') return 'pronto'
    if (minutos >= 20) return 'atrasado'
    if (minutos >= 10) return 'atencao'
    return 'normal'
  }

  const corPedidoCozinha = pedido => {
    const nivel = nivelTempoPedido(pedido)
    if (nivel === 'pronto') return '#22c55e'
    if (nivel === 'atrasado') return '#ef4444'
    if (nivel === 'atencao') return '#f59e0b'
    if (pedido.status === 'preparo') return '#f97316'
    return '#ffb300'
  }

  const textoTempoPedido = pedido => {
    const minutos = minutosDesdePedido(pedido)
    if (minutos === 0) return 'agora'
    return `há ${minutos} min`
  }

  const resumoItemCozinha = item => {
    if (item.tipo === 'executivo') {
      return `${item.nome} — ${(item.espetosInclusos || []).join(', ')} — ${item.acompanhamento || 'Arroz Branco'}${item.observacao ? ` — OBS: ${item.observacao}` : ''}`
    }

    if (item.tipo === 'combo') {
      const comps = (item.componentesInclusos || [])
        .map(c => `${Number(c.qtd || 1)}x ${c.nome}`)
        .join(', ')
      return `${item.nome} — ${(item.espetosInclusos || []).join(', ')}${comps ? ` — ${comps}` : ''}${item.observacao ? ` — OBS: ${item.observacao}` : ''}`
    }

    if (item.tipo === 'lanche') {
      return `${item.nome} — ${item.espetoEscolhido || ''}${item.observacao ? ` — OBS: ${item.observacao}` : ''}`
    }

    return `${item.nome}${item.observacao ? ` — OBS: ${item.observacao}` : ''}`
  }

  const escaparHtmlImpressao = (valor = '') =>
    String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const textoPedidoTermico = pedido => {
    const linhasItens = (pedido.itens || []).map((item, index) => {
      const prefixo = `${index + 1}. `

      if (item.tipo === 'executivo') {
        return `${prefixo}${item.nome}
ESP: ${(item.espetosInclusos || []).join(' / ')}
${item.acompanhamento || 'Arroz Branco'}${item.observacao ? `\nOBS: ${item.observacao}` : ''}`
      }

      if (item.tipo === 'combo') {
        const comps = (item.componentesInclusos || [])
          .map(c => `${Number(c.qtd || 1)}x ${c.nome}`)
          .join(' / ')

        return `${prefixo}${item.nome}
ESP: ${(item.espetosInclusos || []).join(' / ')}${comps ? `\nACOMP: ${comps}` : ''}${item.observacaoCombo ? `\n${item.observacaoCombo}` : ''}${item.observacao ? `\nOBS: ${item.observacao}` : ''}`
      }

      if (item.tipo === 'lanche') {
        return `${prefixo}${item.nome}
ESP: ${item.espetoEscolhido || '-'}${item.observacao ? `\nOBS: ${item.observacao}` : ''}`
      }

      return `${prefixo}${item.nome}${item.observacao ? `\nOBS: ${item.observacao}` : ''}`
    })

    const hora = pedido.criadoEmISO
      ? new Date(pedido.criadoEmISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    return {
      cabecalho: 'MESTRE DO ESPETO',
      numero: `PEDIDO ${String(pedido.numero || 0).padStart(4, '0')}`,
      cliente: pedido.cliente || 'SEM COMANDA',
      atendente: pedido.atendente || '-',
      hora,
      itens: linhasItens
    }
  }

  const imprimirPedidoTermico = (pedido, automatico = false) => {
    const dados = textoPedidoTermico(pedido)
    const win = window.open('', '_blank', 'width=320,height=560')

    if (!win) {
      if (!automatico) alert('Libere pop-ups para imprimir.')
      return false
    }

    const itensHtml = dados.itens.map(item => {
      const linhas = item.split('\n')
      const primeira = escaparHtmlImpressao(linhas.shift() || '')
      const resto = linhas.map(linha => {
        const seguro = escaparHtmlImpressao(linha)
        if (linha.startsWith('OBS:')) {
          return `<div class="obs">${seguro}</div>`
        }
        return `<div class="detalhe">${seguro}</div>`
      }).join('')

      return `<div class="item"><div class="item-titulo">${primeira}</div>${resto}</div>`
    }).join('<div class="separador"></div>')

    win.document.open()
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escaparHtmlImpressao(dados.numero)}</title>
          <style>
            @page { size: 58mm auto; margin: 0; }

            html, body {
              width: 48mm;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 13px;
              line-height: 1.12;
              font-weight: 700;
            }

            .cupom {
              width: 48mm;
              padding: 1mm 0 2mm 0;
            }

            .marca {
              text-align: center;
              font-size: 14px;
              font-weight: 900;
              margin-bottom: 2px;
            }

            .pedido-numero {
              text-align: center;
              font-size: 21px;
              line-height: 1;
              font-weight: 900;
              margin: 3px 0 5px 0;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 4px 0;
            }

            .comanda {
              font-size: 17px;
              line-height: 1.05;
              font-weight: 900;
              margin: 4px 0;
            }

            .meta {
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 5px;
            }

            .item {
              margin: 5px 0;
            }

            .item-titulo {
              font-size: 15px;
              line-height: 1.08;
              font-weight: 900;
            }

            .detalhe {
              font-size: 12px;
              line-height: 1.1;
              margin-top: 1px;
            }

            .obs {
              font-size: 15px;
              line-height: 1.08;
              font-weight: 900;
              border: 2px solid #000;
              padding: 3px;
              margin-top: 3px;
              text-transform: uppercase;
            }

            .separador {
              border-top: 1px dashed #000;
              margin: 4px 0;
            }

            .fim {
              border-top: 2px solid #000;
              margin-top: 5px;
              padding-top: 2px;
              height: 4mm;
            }
          </style>
        </head>
        <body>
          <div class="cupom">
            <div class="marca">${escaparHtmlImpressao(dados.cabecalho)}</div>
            <div class="pedido-numero">${escaparHtmlImpressao(dados.numero)}</div>

            <div class="comanda">${escaparHtmlImpressao(dados.cliente)}</div>
            <div class="meta">
              ATEND: ${escaparHtmlImpressao(dados.atendente)}<br />
              HORA: ${escaparHtmlImpressao(dados.hora)}
            </div>

            ${itensHtml}

            <div class="fim"></div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print()
                setTimeout(() => window.close(), 800)
              }, 120)
            }
          </script>
        </body>
      </html>
    `)
    win.document.close()
    return true
  }

  const imprimirPedidoFilaManual = pedido => {
    imprimirPedidoTermico(pedido, false)
  }

  // IMPORTANTE:
  // A impressão automática pelo navegador foi desativada de propósito.
  // Ela competia com o Agente Windows pelo mesmo pedido no Firestore e podia
  // marcar um pedido como "imprimindo/impresso" antes do agente recebê-lo.
  // O envio para cozinha continua criando statusImpressao='aguardando';
  // o Agente Windows é o único responsável por consumir essa fila.

  const imprimirTexto = (texto) => {
    tocarSom('/impressao.mp3')
    const win = window.open('', '', 'width=340,height=650')
    win.document.write(`<pre style="font-family:monospace;font-size:14px;">${texto}</pre>`)
    win.document.write('<button onclick="window.print()">IMPRIMIR</button>')
    win.print()
  }

  const descricaoItem = (item) => {
    if (item.tipo === 'executivo') {
      return `${item.nome} - R$ ${item.preco.toFixed(2)}\n  Espetos: ${item.espetosInclusos.join(', ')}\n  Acompanhamento: ${item.acompanhamento || 'Arroz Branco'}${item.adicionalBaiao ? ` (+ R$ ${item.adicionalBaiao.toFixed(2)})` : ''}${item.adicionalPremium ? `\n  Adicional premium: R$ ${item.adicionalPremium.toFixed(2)}` : ''}${item.observacao ? `\n  OBS: ${item.observacao}` : ''}`
    }
    if (item.tipo === 'combo') {
      const comps = (item.componentesInclusos || [])
        .map(c => `${Number(c.qtd || 1)}x ${c.nome}`)
        .join(', ')
      return `${item.nome} - R$ ${item.preco.toFixed(2)}\n  Espetos: ${(item.espetosInclusos || []).join(', ')}${comps ? `\n  Acompanha: ${comps}` : ''}${item.observacaoCombo ? `\n  ${item.observacaoCombo}` : ''}${item.observacao ? `\n  OBS: ${item.observacao}` : ''}`
    }
    if (item.tipo === 'lanche') {
      return `${item.nome} - R$ ${item.preco.toFixed(2)}\n  Espeto escolhido: ${item.espetoEscolhido}${item.observacao ? `\n  OBS: ${item.observacao}` : ''}`
    }
    return `${item.nome} - R$ ${item.preco.toFixed(2)}${item.observacaoCombo ? `\n  ${item.observacaoCombo}` : ''}${item.observacao ? `\n  OBS: ${item.observacao}` : ''}`
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
  if (i.tipo === 'executivo' || i.tipo === 'combo') {
    const comps = (i.componentesInclusos || [])
      .map(c => `${Number(c.qtd || 1)}x ${c.nome}`)
      .join(', ')
    return `${i.nome}\n  Espetos: ${(i.espetosInclusos || []).join(', ')}${comps ? `\n  Acompanha: ${comps}` : ''}${i.observacaoCombo ? `\n  ${i.observacaoCombo}` : ''}${i.observacao ? `\n  OBS: ${i.observacao}` : ''}`
  }
  if (i.tipo === 'lanche') {
    return `${i.nome}\n  Espeto escolhido: ${i.espetoEscolhido}${i.observacao ? `\n  OBS: ${i.observacao}` : ''}`
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

  const abrirFechamentoCaixa = () => {
    if (!comandaAtual) return
    if (!comandaAtual.itens || comandaAtual.itens.length === 0) {
      return alert('Comanda sem itens.')
    }

    setValorRecebido('')
    setMostrarFechamentoCaixa(true)

    setTimeout(() => {
      document.getElementById('fechamento-caixa')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }, 100)
  }

  const valorRecebidoNumero = Number(
    String(valorRecebido || '')
      .replace(/\s/g, '')
      .replace(',', '.')
  ) || 0

  const trocoFechamento = pagamento === 'dinheiro'
    ? Math.max(0, valorRecebidoNumero - Number(total || 0))
    : 0

  const confirmarFechamentoComanda = async () => {
    if (!comandaAtual || fechandoComanda) return

    const tipoAtual = comandaAtual.tipoComanda || 'Cliente'
    const ehCliente = tipoAtual === 'Cliente'
    const financeiro = calcularFinanceiroComanda(comandaAtual)
    const totalFechamento = ehCliente
      ? Number(financeiro.totalVenda || 0)
      : Number(financeiro.totalRepasse || 0)

    if (ehCliente && pagamento === 'dinheiro' && valorRecebidoNumero < totalFechamento) {
      return alert(
        `Valor recebido insuficiente.\n\n` +
        `Total: R$ ${totalFechamento.toFixed(2)}\n` +
        `Recebido: R$ ${valorRecebidoNumero.toFixed(2)}`
      )
    }

    const nomePagamento = pagamento === 'dinheiro'
      ? 'Dinheiro'
      : pagamento === 'pix'
        ? 'Pix'
        : 'Cartão'

    const troco = ehCliente && pagamento === 'dinheiro'
      ? Math.max(0, valorRecebidoNumero - totalFechamento)
      : 0

    const mensagem = ehCliente
      ? `CONFIRMAR PAGAMENTO?\n\n` +
        `Comanda: ${comandaAtual.cliente}\n` +
        `Total: R$ ${totalFechamento.toFixed(2)}\n` +
        `Pagamento: ${nomePagamento}` +
        (pagamento === 'dinheiro'
          ? `\nRecebido: R$ ${valorRecebidoNumero.toFixed(2)}\nTroco: R$ ${troco.toFixed(2)}`
          : '')
      : `CONFIRMAR FECHAMENTO?\n\n` +
        `Comanda: ${comandaAtual.cliente}\n` +
        `Tipo: ${tipoAtual}\n` +
        `Total a repassar / custo: R$ ${totalFechamento.toFixed(2)}`

    if (!confirm(mensagem)) return

    setFechandoComanda(true)

    try {
      const dataFechamento = hoje()

      // Sprint 1.2G-C: congela os custos usados nesta venda.
      // Assim, futuras alterações no cardápio não modificam a margem histórica.
      const itensComCustoHistorico = (comandaAtual.itens || []).map(item => ({
        ...item,
        precoCusto: Number(item.precoCusto ?? custoProduto(item.estoqueNome || item.nome) ?? 0),
        detalhesEspetos: (item.detalhesEspetos || []).map(espeto => ({
          ...espeto,
          precoCusto: Number(espeto.precoCusto ?? custoProduto(espeto.nome) ?? 0)
        })),
        componentesInclusos: (item.componentesInclusos || []).map(comp => ({
          ...comp,
          precoCusto: Number(comp.precoCusto ?? custoProduto(comp.nome) ?? 0)
        }))
      }))

      await addDoc(collection(db, 'historico'), {
        ...comandaAtual,
        itens: itensComCustoHistorico,
        custoHistoricoCongelado: true,
        versaoCustoHistorico: '1.2G-C',
        pagamento: ehCliente ? pagamento : 'interno',
        formaPagamento: ehCliente ? nomePagamento : 'Consumo interno',
        valorRecebido: ehCliente && pagamento === 'dinheiro'
          ? valorRecebidoNumero
          : totalFechamento,
        troco: ehCliente && pagamento === 'dinheiro' ? troco : 0,
        total: totalFechamento,
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
      setMostrarFechamentoCaixa(false)
      setValorRecebido('')
      setPagamento('dinheiro')

      alert(
        ehCliente
          ? `✅ Pagamento confirmado!\n\n` +
            `Total: R$ ${totalFechamento.toFixed(2)}` +
            (pagamento === 'dinheiro' ? `\nTroco: R$ ${troco.toFixed(2)}` : '')
          : '✅ Comanda interna fechada com sucesso!'
      )
    } catch (error) {
      console.error('Erro ao fechar comanda:', error)
      alert('Não foi possível fechar a comanda. Tente novamente.')
    } finally {
      setFechandoComanda(false)
    }
  }

  const fecharComanda = () => abrirFechamentoCaixa()

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
        if (item.tipo === 'executivo' || item.tipo === 'combo' || item.tipo === 'lanche') {
          ;(item.espetosInclusos || []).forEach(nome => {
            saidas[nome] = (saidas[nome] || 0) + 1
          })
          if (item.tipo === 'combo') {
            ;(item.componentesInclusos || []).forEach(comp => {
              saidas[comp.nome] = (saidas[comp.nome] || 0) + Number(comp.qtd || 1)
            })
          }
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

  const comandasClientesGerencial = rel.comandas.filter(c =>
    (c.tipoComanda || 'Cliente') === 'Cliente'
  )

  const quantidadeComandasClientesGerencial = comandasClientesGerencial.length
  const ticketMedioGerencial = quantidadeComandasClientesGerencial > 0
    ? rel.totalVendas / quantidadeComandasClientesGerencial
    : 0

  // Sprint 1.2G-C.1:
  // Relatórios históricos NÃO podem mudar quando o custo atual do cardápio muda.
  // Prioridade:
  // 1) totalCusto já gravado no fechamento da comanda;
  // 2) custos congelados dentro dos itens;
  // 3) custo atual somente como último fallback para registros muito antigos.
  const calcularCustoItemHistoricoGerencial = (item) => {
    if (item.tipo === 'executivo' || item.tipo === 'combo' || item.tipo === 'lanche') {
      const detalhes = item.detalhesEspetos || []
      const nomes = detalhes.length
        ? detalhes.map(e => e.nome)
        : (item.espetosInclusos || [])

      let custo = nomes.reduce((acc, nome) => {
        const detalhe = detalhes.find(e => e.nome === nome)
        return acc + Number(detalhe?.precoCusto ?? custoProduto(nome) ?? 0)
      }, 0)

      if (item.tipo === 'combo') {
        custo += (item.componentesInclusos || []).reduce((acc, comp) =>
          acc + Number(comp.precoCusto ?? custoProduto(comp.nome) ?? 0) * Number(comp.qtd || 1), 0
        )
      }

      return custo
    }

    return Number(item.precoCusto ?? custoProduto(item.estoqueNome || item.nome) ?? 0)
  }

  const custoVendasGerencial = comandasClientesGerencial.reduce((acc, c) => {
    if (c.totalCusto !== undefined && c.totalCusto !== null) {
      return acc + Number(c.totalCusto || 0)
    }

    return acc + (c.itens || []).reduce(
      (subtotal, item) => subtotal + calcularCustoItemHistoricoGerencial(item),
      0
    )
  }, 0)

  const itensSemCustoGerencial = itensCardapio
    .filter(item => item.ativo !== false && Number(item.precoCusto || 0) <= 0)
    .sort((a, b) => String(a.categoria || '').localeCompare(String(b.categoria || '')) || String(a.nome || '').localeCompare(String(b.nome || '')))

  const margemBrutaGerencial = rel.totalVendas - custoVendasGerencial
  const margemBrutaPercentualGerencial = rel.totalVendas > 0
    ? (margemBrutaGerencial / rel.totalVendas) * 100
    : 0

  const rankingProdutosGerencial = Object.entries(rel.produtos || {})
    .map(([nome, dados]) => ({
      nome,
      qtd: Number(dados.qtd || 0),
      total: Number(dados.total || 0)
    }))
    .sort((a, b) => b.qtd - a.qtd || b.total - a.total)

  const produtoMaisVendidoGerencial = rankingProdutosGerencial[0] || null
  const produtoMenosVendidoGerencial = rankingProdutosGerencial.length
    ? [...rankingProdutosGerencial].sort((a, b) => a.qtd - b.qtd || a.total - b.total)[0]
    : null

  const caixaGerencialSelecionado = historicoCaixas.find(c =>
    (c.data || c.id) === dataRelatorio
  ) || null

  const diferencaCaixaGerencial = Number(caixaGerencialSelecionado?.diferenca || 0)
  const suprimentosGerencial = Number(caixaGerencialSelecionado?.totalSuprimentos || 0)
  const sangriasGerencial = Number(caixaGerencialSelecionado?.totalSangrias || 0)

  const imprimirDashboardGerencial = () => {
    const linhasRanking = rankingProdutosGerencial.slice(0, 15)
      .map((p, i) => `${i + 1}. ${p.nome} — ${p.qtd} un. — R$ ${formatarMoedaBR(p.total)}`)
      .join('\n')

    const texto = `
RELATÓRIO GERENCIAL — ${formatarDataBR(dataRelatorio)}
MESTRE DO ESPETO

FATURAMENTO
Faturamento clientes: R$ ${formatarMoedaBR(rel.totalVendas)}
Comandas de clientes: ${quantidadeComandasClientesGerencial}
Ticket médio: R$ ${formatarMoedaBR(ticketMedioGerencial)}
Itens registrados: ${rel.totalItens}

FORMAS DE PAGAMENTO
Dinheiro: R$ ${formatarMoedaBR(rel.caixaData.dinheiro)}
Pix: R$ ${formatarMoedaBR(rel.caixaData.pix)}
Cartão: R$ ${formatarMoedaBR(rel.caixaData.cartao)}

RESULTADO BRUTO ESTIMADO
Custo conhecido das vendas: R$ ${formatarMoedaBR(custoVendasGerencial)}
Margem bruta estimada: R$ ${formatarMoedaBR(margemBrutaGerencial)}
Margem bruta estimada: ${margemBrutaPercentualGerencial.toFixed(1).replace('.', ',')}%

CONSUMO INTERNO
Custo do consumo interno: R$ ${formatarMoedaBR(rel.totalConsumoInterno)}
Total a repassar: R$ ${formatarMoedaBR(rel.totalRepasseInterno)}

CAIXA
Suprimentos: R$ ${formatarMoedaBR(suprimentosGerencial)}
Sangrias: R$ ${formatarMoedaBR(sangriasGerencial)}
Diferença de caixa: R$ ${formatarMoedaBR(diferencaCaixaGerencial)}
Status: ${caixaGerencialSelecionado?.status === 'fechado' ? 'Fechado' : caixaGerencialSelecionado?.status === 'aberto' ? 'Aberto' : 'Sem caixa registrado'}

DESTAQUES
Mais vendido: ${produtoMaisVendidoGerencial ? `${produtoMaisVendidoGerencial.nome} — ${produtoMaisVendidoGerencial.qtd} un.` : 'Sem vendas'}
Menos vendido: ${produtoMenosVendidoGerencial ? `${produtoMenosVendidoGerencial.nome} — ${produtoMenosVendidoGerencial.qtd} un.` : 'Sem vendas'}

RANKING DE PRODUTOS
${linhasRanking || 'Sem produtos vendidos.'}

Observação: custo e margem são estimativas baseadas nos custos cadastrados no sistema.
Itens sem custo cadastrado entram com custo R$ 0,00.
`

    const janela = window.open('', '_blank', 'width=760,height=900')
    if (!janela) return alert('O navegador bloqueou a janela de impressão.')

    janela.document.write(`
      <html>
        <head>
          <title>Relatório Gerencial ${formatarDataBR(dataRelatorio)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; white-space: pre-wrap; color: #111; }
            h1 { font-size: 22px; }
            pre { font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.5; font-size: 14px; }
          </style>
        </head>
        <body><pre>${texto}</pre></body>
      </html>
    `)
    janela.document.close()
    janela.focus()
    setTimeout(() => janela.print(), 250)
  }


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

  const migrarCardapioOficial = async () => {
    if (!adminLiberado) return alert('Acesso administrativo necessário.')

    const confirmar = confirm(
      'Será criado um backup e o cardápio será reconstruído com apenas uma cópia de cada produto. Comandas, histórico e estoque não serão apagados. Continuar?'
    )
    if (!confirmar) return

    try {
      const snapshotAtual = await getDocs(collection(db, 'cardapio'))
      const agora = new Date()
      const nomeBackup = `cardapio_backup_${agora.toISOString().replace(/[:.]/g, '-')}`

      if (!snapshotAtual.empty) {
        await Promise.all(snapshotAtual.docs.map(d =>
          addDoc(collection(db, nomeBackup), {
            ...d.data(),
            idOriginal: d.id,
            backupEm: agora.toISOString()
          })
        ))
      }

      const mapaOficial = new Map()
      montarItensPadraoCardapio().forEach(item => {
        const chave = `${String(item.categoria || '').trim().toLowerCase()}::${String(item.nome || '').trim().toLowerCase()}`
        mapaOficial.set(chave, item)
      })
      const itensOficiais = Array.from(mapaOficial.values())

      await Promise.all(snapshotAtual.docs.map(d =>
        deleteDoc(doc(db, 'cardapio', d.id))
      ))

      await Promise.all(itensOficiais.map(item =>
        addDoc(collection(db, 'cardapio'), item)
      ))

      const estoqueAtualizado = { ...estoque }
      itensOficiais.forEach(item => {
        if (item.controlaEstoque === false) return
        const nomeEstoque = item.estoqueNome || item.nome
        if (estoqueAtualizado[nomeEstoque] === undefined) {
          estoqueAtualizado[nomeEstoque] = 0
        }
      })
      await salvarEstoque(estoqueAtualizado)

      alert(`Cardápio corrigido: ${itensOficiais.length} itens únicos. Backup: ${nomeBackup}`)
    } catch (error) {
      console.error('Erro ao corrigir cardápio:', error)
      alert('Erro ao corrigir o cardápio. Não execute novamente até verificarmos.')
    }
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

  const selecionarComanda = (comanda) => {
    setComandaAtual(comanda)

    setTimeout(() => {
      document.getElementById('comanda-detalhe')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
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
      <div style={{
        margin: '10px 0 14px',
        padding: '10px 14px',
        borderRadius: 10,
        fontWeight: 800,
        background: agenteImpressaoStatus.online ? '#123d20' : '#4a1717',
        border: `1px solid ${agenteImpressaoStatus.online ? '#25c75a' : '#ff5a5a'}`
      }}>
        {agenteImpressaoStatus.online ? '🟢' : '🔴'} Agente de impressão: {agenteImpressaoStatus.online ? 'ONLINE' : 'OFFLINE'}
        {agenteImpressaoStatus.online && agenteImpressaoStatus.impressora
          ? ` — ${agenteImpressaoStatus.impressora}`
          : ''}
        {!agenteImpressaoStatus.online
          ? ' — Verifique o computador, o agente e a conexão.'
          : ''}
      </div>

        <img src="/logo.png" alt="Mestre do Espeto" style={styles.logoSplash} />
        <h1>MESTRE DO ESPETO</h1>
        <p>Carregando sistema...</p>
      </div>
    )
  }

  if (!usuarioEntrou) {
    return (
      <LoginScreen
        nomeEntrada={nomeEntrada}
        setNomeEntrada={setNomeEntrada}
        entrarNoSistema={entrarNoSistema}
      />
    )
  }

  return (
    <div style={styles.app}>
      <HeaderBar
        atendente={atendente}
        adminLiberado={adminLiberado}
        trocarAtendente={trocarAtendente}
        liberarAdministrador={liberarAdministrador}
        bloquearAdministrador={bloquearAdministrador}
      />

      <div style={styles.card}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap'
        }}>
          <div>
            <strong style={{ fontSize: 18 }}>🔔 Alertas do Atendimento</strong>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 3 }}>
              Som: {audioAlertasLiberado ? '✅ ativado neste aparelho' : '🔇 precisa ser ativado'}
            </div>
          </div>

          {!audioAlertasLiberado && (
            <button
              onClick={ativarAudioAlertas}
              style={{
                ...styles.green,
                minHeight: 48,
                fontSize: 16,
                fontWeight: 900
              }}
            >
              🔊 ATIVAR SOM
            </button>
          )}
        </div>

        {alertasPedidosProntos.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {alertasPedidosProntos.map(pedido => (
              <div
                key={pedido.id}
                style={{
                  background: '#12351e',
                  border: '3px solid #22c55e',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 9,
                  boxShadow: '0 0 0 2px rgba(34,197,94,0.15)'
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                  🔔 PEDIDO #{String(pedido.numero || 0).padStart(4, '0')} PRONTO
                </div>
                <div style={{ fontSize: 20, marginTop: 5, fontWeight: 800 }}>
                  {pedido.cliente || 'Sem referência'}
                </div>
                <div style={{ marginTop: 4 }}>
                  Atendente: <strong>{pedido.atendente || '-'}</strong>
                </div>
                <button
                  onClick={() => dispensarAlertaPedidoPronto(pedido.id)}
                  style={{
                    ...styles.green,
                    width: '100%',
                    minHeight: 52,
                    marginTop: 10,
                    fontSize: 17,
                    fontWeight: 900
                  }}
                >
                  👍 CIENTE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <button
          onClick={() => setMostrarFilaCozinha(!mostrarFilaCozinha)}
          style={{
            ...styles.yellow,
            fontSize: 18,
            fontWeight: 900,
            padding: '15px 18px'
          }}
        >
          👨‍🍳 Fila da Cozinha ({pedidosCozinha.length})
        </button>

        {mostrarFilaCozinha && (
          <div style={{ marginTop: 14 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap'
            }}>
              <h2 style={{ margin: 0 }}>🔥 Painel da Cozinha — ordem de chegada</h2>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                ☁️ Atualizado: {ultimaSincronizacaoCozinha
                  ? ultimaSincronizacaoCozinha.toLocaleTimeString('pt-BR')
                  : 'aguardando...'}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 8,
              margin: '12px 0'
            }}>
              <div style={{ background: '#3a3000', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                <strong style={{ fontSize: 22 }}>
                  {pedidosCozinha.filter(p => p.status === 'novo').length}
                </strong>
                <div>🟡 Novos</div>
              </div>

              <div style={{ background: '#3b1f0b', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                <strong style={{ fontSize: 22 }}>
                  {pedidosCozinha.filter(p => p.status === 'preparo').length}
                </strong>
                <div>🔥 Em preparo</div>
              </div>

              <div style={{ background: '#12351e', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                <strong style={{ fontSize: 22 }}>
                  {pedidosCozinha.filter(p => p.status === 'pronto').length}
                </strong>
                <div>🟢 Prontos</div>
              </div>

              <div style={{ background: '#401414', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                <strong style={{ fontSize: 22 }}>
                  {pedidosCozinha.filter(p => minutosDesdePedido(p) >= 20 && p.status !== 'pronto').length}
                </strong>
                <div>⏱️ +20 min</div>
              </div>
            </div>

            <div style={{
              padding: 10,
              marginBottom: 12,
              background: postoImpressaoAtivo ? '#3b1b1b' : '#17351f',
              borderRadius: 8,
              border: postoImpressaoAtivo ? '1px solid #ef4444' : '1px solid #22c55e'
            }}>
              <strong>Agente Windows: use esta forma para impressão automática.</strong>
              <div style={{ marginTop: 4, fontSize: 13 }}>
                Posto de impressão do navegador: {postoImpressaoAtivo ? '🔴 ATIVO — desative para evitar duplicidade' : '✅ DESATIVADO'}
              </div>

              {postoImpressaoAtivo && (
                <button
                  onClick={() => {
                    setPostoImpressaoAtivo(false)
                    localStorage.setItem('mestre_posto_impressao', '0')
                  }}
                  style={{ ...styles.red, marginTop: 8 }}
                >
                  ⏹ Desativar impressão pelo navegador
                </button>
              )}
            </div>

            {pedidosCozinha.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 24,
                background: '#1f1f1f',
                borderRadius: 10
              }}>
                ✅ Nenhum pedido aguardando.
              </div>
            )}

            {pedidosCozinha.map(pedido => {
              const minutos = minutosDesdePedido(pedido)
              const nivelTempo = nivelTempoPedido(pedido)
              const cor = corPedidoCozinha(pedido)

              return (
                <div
                  key={pedido.id}
                  style={{
                    background: '#202020',
                    border: `3px solid ${cor}`,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                    boxShadow: nivelTempo === 'atrasado'
                      ? '0 0 0 2px rgba(239,68,68,0.18)'
                      : 'none'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 10,
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{ fontSize: 25, fontWeight: 900 }}>
                        #{String(pedido.numero || 0).padStart(4, '0')} — {pedido.cliente || 'Sem referência'}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 14 }}>
                        Atendente: <strong>{pedido.atendente || '-'}</strong>
                      </div>
                    </div>

                    <div style={{
                      background: cor,
                      color: nivelTempo === 'atencao' ? '#111' : '#fff',
                      borderRadius: 10,
                      padding: '8px 12px',
                      textAlign: 'center',
                      minWidth: 120,
                      fontWeight: 900
                    }}>
                      <div style={{ fontSize: 16 }}>{rotuloStatusCozinha(pedido.status)}</div>
                      <div style={{ fontSize: 20 }}>{textoTempoPedido(pedido)}</div>
                    </div>
                  </div>

                  {nivelTempo === 'atrasado' && pedido.status !== 'pronto' && (
                    <div style={{
                      marginTop: 10,
                      background: '#541919',
                      border: '1px solid #ef4444',
                      borderRadius: 8,
                      padding: 8,
                      fontWeight: 900
                    }}>
                      🚨 ATENÇÃO: pedido aguardando há {minutos} minutos.
                    </div>
                  )}

                  {nivelTempo === 'atencao' && pedido.status !== 'pronto' && (
                    <div style={{
                      marginTop: 10,
                      background: '#493609',
                      border: '1px solid #f59e0b',
                      borderRadius: 8,
                      padding: 8,
                      fontWeight: 800
                    }}>
                      ⏱️ Pedido entrando em tempo de atenção.
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    {(pedido.itens || []).map((item, index) => (
                      <div
                        key={item.cozinhaItemId || index}
                        style={{
                          padding: '10px 0',
                          borderTop: index ? '1px solid #494949' : 'none',
                          fontSize: 17,
                          lineHeight: 1.35
                        }}
                      >
                        <strong>{index + 1}.</strong> {resumoItemCozinha(item)}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
                    Impressão: {pedido.statusImpressao === 'impresso'
                      ? '✅ Impresso'
                      : pedido.statusImpressao === 'imprimindo'
                        ? '🖨️ Imprimindo'
                        : '⏳ Aguardando'}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 9,
                    marginTop: 12
                  }}>
                    <button
                      onClick={() => imprimirPedidoFilaManual(pedido)}
                      style={{
                        ...styles.smallBtn,
                        minHeight: 50,
                        fontSize: 15,
                        fontWeight: 800
                      }}
                    >
                      🖨️ Reimprimir
                    </button>

                    {pedido.status === 'novo' && (
                      <button
                        onClick={() => atualizarStatusPedidoCozinha(pedido, 'preparo')}
                        style={{
                          ...styles.yellow,
                          minHeight: 54,
                          fontSize: 17,
                          fontWeight: 900
                        }}
                      >
                        🔥 INICIAR PREPARO
                      </button>
                    )}

                    {pedido.status === 'preparo' && (
                      <button
                        onClick={() => atualizarStatusPedidoCozinha(pedido, 'pronto')}
                        style={{
                          ...styles.green,
                          minHeight: 58,
                          fontSize: 18,
                          fontWeight: 900
                        }}
                      >
                        🟢 PEDIDO PRONTO
                      </button>
                    )}

                    {pedido.status === 'pronto' && (
                      <button
                        onClick={() => atualizarStatusPedidoCozinha(pedido, 'entregue')}
                        style={{
                          ...styles.green,
                          minHeight: 58,
                          fontSize: 18,
                          fontWeight: 900
                        }}
                      >
                        ✅ MARCAR ENTREGUE
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2>Nova Comanda</h2>
        <input placeholder="Nome / Mesa / Referência" value={cliente} onChange={e => setCliente(e.target.value)} style={styles.input} />

        {adminLiberado ? (
          <>
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
          </>
        ) : (
          <p style={styles.operacionalInfo}>Tipo de comanda: Cliente</p>
        )}

        <button onClick={criarComanda} style={styles.green}>➕ Criar Comanda</button>
      </div>

      <div style={styles.card}>
        <h2>Comandas Abertas em Tempo Real</h2>
        <input placeholder="Buscar comanda..." value={busca} onChange={e => setBusca(e.target.value)} style={styles.input} />
        {comandasFiltradas.map(c => (
          <button
            key={c.id}
            onClick={() => selecionarComanda(c)}
            style={{
              ...styles.smallBtn,
              background: comandaAtual?.id === c.id ? '#5a0000' : styles.smallBtn.background,
              border: comandaAtual?.id === c.id ? '2px solid #ffb300' : 'none'
            }}
          >
            {c.tipoComanda || 'Cliente'} — {c.cliente} — {(c.itens || []).length} itens
          </button>
        ))}
      </div>

      {executivoSelecionado && (
        <div id="selecao-executivo" style={styles.cardDestaque}>
          <h2>🍽️ Monte seu Prato — {executivoSelecionado.nome}</h2>
          <p>Selecione {executivoSelecionado.qtdEspetos} espetos. Pode repetir o mesmo espeto.</p>
          <p>Espeto premium no prato: adicional de R$ 5,00.</p>

          <h3>Selecionados:</h3>
          {espetosExecutivo.length === 0 && <p>Nenhum selecionado</p>}
          {espetosExecutivo.map((e, index) => (
            <div key={index} style={styles.itemLinha}>
              <span>{index + 1}. {e.nome} {e.premium ? '(Premium + R$5)' : ''}</span>
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
                {e.premium ? 'Premium + R$5 no prato' : 'Incluso no executivo'}<br />
                Estoque: {estoque[e.nome] || 0}
              </button>
            ))}
          </div>

                    <div style={{
            background: '#2b2b2b',
            border: '1px solid #666',
            borderRadius: 10,
            padding: 12,
            marginTop: 14,
            marginBottom: 14
          }}>
            <h3>🍚 Escolha o acompanhamento</h3>
            <label style={{ display: 'block', marginBottom: 10, cursor: 'pointer' }}>
              <input
                type="radio"
                name="acompanhamentoExecutivo"
                checked={!baiaoExecutivo}
                onChange={() => setBaiaoExecutivo(false)}
                style={{ marginRight: 8 }}
              />
              Arroz Branco — incluso
            </label>
            <label style={{ display: 'block', cursor: 'pointer', fontWeight: 'bold' }}>
              <input
                type="radio"
                name="acompanhamentoExecutivo"
                checked={baiaoExecutivo}
                onChange={() => setBaiaoExecutivo(true)}
                style={{ marginRight: 8 }}
              />
              Baião de Dois — + R$ 4,00
            </label>
          </div>

          <h3>
            Total do prato: R$ {(Number(executivoSelecionado.preco ?? 0) +
              espetosExecutivo.reduce((acc, e) => acc + (e.adicional || 0), 0) +
              (baiaoExecutivo ? 4 : 0)
            ).toFixed(2)}
          </h3>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label><strong>📝 Observação do prato</strong></label>
            <textarea
              placeholder="Ex.: sem vinagrete, sem farofa, sem cebola..."
              value={observacaoExecutivo}
              onChange={e => setObservacaoExecutivo(e.target.value)}
              style={{ ...styles.input, minHeight: 70 }}
            />
          </div>

<button onClick={confirmarExecutivo} style={styles.green}>✅ Confirmar Executivo</button>
          <button onClick={() => setExecutivoSelecionado(null)} style={styles.red}>Cancelar</button>
        </div>
      )}

      {comboSelecionado && (
        <div id="selecao-combo" style={styles.cardDestaque}>
          <h2>🎁 {comboSelecionado.nome}</h2>
          <p>
            Escolha {comboSelecionado.qtdEspetosCombo} espetos tradicionais.
            Pode repetir o mesmo espeto.
          </p>

          <h3>Selecionados: {espetosCombo.length}/{comboSelecionado.qtdEspetosCombo}</h3>

          {espetosCombo.length === 0 && <p>Nenhum espeto selecionado.</p>}

          {espetosCombo.map((e, index) => (
            <div key={index} style={styles.itemLinha}>
              <span>{index + 1}. {e.nome}</span>
              <button onClick={() => removerEspetoCombo(index)}>❌</button>
            </div>
          ))}

          <div style={styles.grid}>
            {(cardapio.Espetos || []).map(e => (
              <button
                key={e.id || e.nome}
                onClick={() => adicionarEspetoCombo(e)}
                style={styles.itemBtn}
              >
                <strong>{e.nome}</strong><br />
                Tradicional<br />
                Estoque: {estoque[e.nome] || 0}
              </button>
            ))}
          </div>

          {comboSelecionado.nome === 'Família Mestre' && (
            <div style={{
              background: '#3b2600',
              border: '1px solid #ffb300',
              borderRadius: 10,
              padding: 12,
              marginTop: 12,
              marginBottom: 12
            }}>
              <label style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={upgradeBatataCombo}
                  onChange={e => setUpgradeBatataCombo(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                🍟 Upgrade para Batata Mestre + R$ 10,00
              </label>
            </div>
          )}

          <h3>
            Total do combo: R$ {(Number(comboSelecionado.preco ?? 0) +
              (comboSelecionado.nome === 'Família Mestre' && upgradeBatataCombo ? 10 : 0)
            ).toFixed(2)}
          </h3>

                    <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label><strong>📝 Observação do combo</strong></label>
            <textarea
              placeholder="Ex.: sem gelo, refrigerante sem gelo, retirar algum item..."
              value={observacaoCombo}
              onChange={e => setObservacaoCombo(e.target.value)}
              style={{ ...styles.input, minHeight: 70 }}
            />
          </div>

          <div style={{
            background: '#222',
            border: '1px solid #555',
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
            marginBottom: 12
          }}>
            <h3>📦 Itens incluídos automaticamente</h3>

            {comboSelecionado.nome === 'Happy Mestre' && (
              <p>🍺 1x Chopp Brahma 350ml</p>
            )}

            {comboSelecionado.nome === 'Almoço Mestre' && (
              <p>🍊 1x Suco Natural Laranja 400ml</p>
            )}

            {comboSelecionado.nome === 'Família Mestre' && (
              <>
                <p>
                  🍟 1x {upgradeBatataCombo ? 'Batata Mestre 700g' : 'Batata Cheddar e Bacon 600g'}
                </p>

                <label><strong>🥤 Refrigerante 1L incluído</strong></label>
                <select
                  value={refrigeranteFamilia}
                  onChange={e => setRefrigeranteFamilia(e.target.value)}
                  style={styles.input}
                >
                  <option value="Coca-Cola 1L">Coca-Cola 1L</option>
                  <option value="Coca-Cola Zero 1L">Coca-Cola Zero 1L</option>
                  <option value="Guaraná 1L">Guaraná 1L</option>
                  <option value="Guaraná Zero 1L">Guaraná Zero 1L</option>
                </select>
              </>
            )}
          </div>

<button onClick={confirmarCombo} style={styles.green}>
            ✅ Confirmar Combo
          </button>
          <button
            onClick={() => {
              setComboSelecionado(null)
              setEspetosCombo([])
              setUpgradeBatataCombo(false)
            }}
            style={styles.red}
          >
            Cancelar
          </button>
        </div>
      )}

      {lancheSelecionado && (
        <div id="selecao-lanche" style={styles.cardDestaque}>
          <h2>🥖 Lanche no Espeto</h2>
          <p>Escolha 1 espeto tradicional para montar o lanche.</p>

          {espetoLanche && (
            <div style={styles.box}>
              <strong>Selecionado:</strong> {espetoLanche.nome}
            </div>
          )}

          <div style={styles.grid}>
            {(cardapio.Espetos || []).map(e => (
              <button
                key={e.id || e.nome}
                onClick={() => selecionarEspetoLanche(e)}
                style={{
                  ...styles.itemBtn,
                  border: espetoLanche?.nome === e.nome ? '2px solid #ffb300' : 'none'
                }}
              >
                <strong>{e.nome}</strong><br />
                Tradicional<br />
                Estoque: {estoque[e.nome] || 0}
              </button>
            ))}
          </div>

          <h3>Preço do lanche: R$ {Number(lancheSelecionado.preco ?? 0).toFixed(2)}</h3>

                    <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label><strong>📝 Observação do lanche</strong></label>
            <textarea
              placeholder="Ex.: sem vinagrete, sem molho de alho..."
              value={observacaoLanche}
              onChange={e => setObservacaoLanche(e.target.value)}
              style={{ ...styles.input, minHeight: 70 }}
            />
          </div>

<button onClick={confirmarLanche} style={styles.green}>
            ✅ Confirmar Lanche
          </button>
          <button
            onClick={() => {
              setLancheSelecionado(null)
              setEspetoLanche(null)
            }}
            style={styles.red}
          >
            Cancelar
          </button>
        </div>
      )}

      {comandaAtual && (
        <div id="comanda-detalhe" style={{ ...styles.card, border: '2px solid #ffb300' }}>
          <h2 style={{ marginBottom: 4 }}>🧾 Comanda: {comandaAtual.cliente}</h2>
          <p>Tipo: {comandaAtual.tipoComanda || 'Cliente'} {comandaAtual.motivo ? `| Motivo: ${comandaAtual.motivo}` : ''}</p>

          <PainelCardapioComanda
            cardapio={cardapio}
            estoque={estoque}
            adicionarItem={adicionarItem}
            abrirSelecaoExecutivo={abrirSelecaoExecutivo}
            abrirSelecaoCombo={abrirSelecaoCombo}
            abrirSelecaoLanche={abrirSelecaoLanche}
          />

          <ItensComandaPanel
            comandaAtual={comandaAtual}
            cardapio={cardapio}
            adminLiberado={adminLiberado}
            custoProduto={custoProduto}
            adicionarItem={adicionarItem}
            removerItem={removerItem}
            abrirSelecaoExecutivo={abrirSelecaoExecutivo}
          />

          {(comandaAtual.tipoComanda || 'Cliente') === 'Cliente' ? (
            <h2>Total: R$ {total.toFixed(2)}</h2>
          ) : (
            <div style={styles.box}>
              <h2>Total a repassar / custo: R$ {total.toFixed(2)}</h2>
              <p>Valor de venda apenas para referência: R$ {totalVendaComandaAtual.toFixed(2)}</p>
              <p>Este consumo não entra no faturamento de clientes.</p>
            </div>
          )}

          {(comandaAtual.tipoComanda || 'Cliente') === 'Cliente' && (
            <select
              value={pagamento}
              onChange={e => {
                setPagamento(e.target.value)
                setValorRecebido('')
              }}
              style={styles.input}
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">Pix</option>
              <option value="cartao">Cartão</option>
            </select>
          )}

          <button
            onClick={enviarParaCozinha}
            style={styles.yellow}
            disabled={enviandoCozinha}
          >
            {enviandoCozinha ? '⏳ Enviando...' : '🔥 Enviar para Cozinha'}
          </button>

          <button onClick={imprimirCozinha} style={styles.smallBtn}>
            🖨️ Imprimir manualmente
          </button>

<button onClick={imprimirCliente} style={styles.green}>
  🖨️ Imprimir Comanda Cliente
</button>

{adminLiberado && (
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
)}

<button onClick={fecharComanda} style={styles.red}>
  💰 Ir para Fechamento
</button>

{mostrarFechamentoCaixa && (
  <div
    id="fechamento-caixa"
    style={{
      marginTop: 14,
      padding: 16,
      borderRadius: 12,
      border: '3px solid #22c55e',
      background: '#10291a'
    }}
  >
    <h2 style={{ marginTop: 0 }}>💰 FECHAMENTO — {comandaAtual.cliente}</h2>

    <div style={{
      background: '#07150c',
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 14, opacity: 0.8 }}>
        {(comandaAtual.tipoComanda || 'Cliente') === 'Cliente'
          ? 'TOTAL DA CONTA'
          : 'TOTAL A REPASSAR / CUSTO'}
      </div>
      <div style={{ fontSize: 34, fontWeight: 900 }}>
        R$ {Number(total || 0).toFixed(2)}
      </div>
    </div>

    {(comandaAtual.tipoComanda || 'Cliente') === 'Cliente' ? (
      <>
        <label><strong>Forma de pagamento</strong></label>
        <select
          value={pagamento}
          onChange={e => {
            setPagamento(e.target.value)
            setValorRecebido('')
          }}
          style={{ ...styles.input, fontSize: 18, minHeight: 52 }}
        >
          <option value="dinheiro">💵 Dinheiro</option>
          <option value="pix">📱 Pix</option>
          <option value="cartao">💳 Cartão</option>
        </select>

        {pagamento === 'dinheiro' && (
          <div style={{ marginTop: 12 }}>
            <label><strong>Valor recebido</strong></label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 100,00"
              value={valorRecebido}
              onChange={e => setValorRecebido(e.target.value.replace(/[^0-9,.]/g, ''))}
              style={{ ...styles.input, fontSize: 22, minHeight: 54 }}
            />

            <div style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 10,
              background: valorRecebidoNumero >= Number(total || 0) ? '#17351f' : '#3b1b1b',
              fontSize: 22,
              fontWeight: 900
            }}>
              Troco: R$ {trocoFechamento.toFixed(2)}
            </div>

            {valorRecebido && valorRecebidoNumero < Number(total || 0) && (
              <div style={{ marginTop: 8, color: '#fca5a5', fontWeight: 800 }}>
                ⚠️ Valor recebido menor que o total da conta.
              </div>
            )}
          </div>
        )}
      </>
    ) : (
      <div style={styles.box}>
        Consumo interno: este fechamento não entra no faturamento de clientes.
      </div>
    )}

    <button
      onClick={confirmarFechamentoComanda}
      disabled={
        fechandoComanda ||
        (
          (comandaAtual.tipoComanda || 'Cliente') === 'Cliente' &&
          pagamento === 'dinheiro' &&
          valorRecebidoNumero < Number(total || 0)
        )
      }
      style={{
        ...styles.green,
        width: '100%',
        minHeight: 58,
        marginTop: 14,
        fontSize: 18,
        fontWeight: 900,
        opacity: fechandoComanda ? 0.6 : 1
      }}
    >
      {fechandoComanda ? '⏳ FECHANDO...' : '✅ CONFIRMAR PAGAMENTO E FECHAR'}
    </button>

    <button
      onClick={() => {
        setMostrarFechamentoCaixa(false)
        setValorRecebido('')
      }}
      disabled={fechandoComanda}
      style={{ ...styles.smallBtn, width: '100%', marginTop: 8 }}
    >
      ← Voltar sem fechar
    </button>
  </div>
)}
        </div>
      )}

 {adminLiberado && (
 <div style={styles.card}>
  <button
    onClick={() => setMostrarGestaoCardapio(!mostrarGestaoCardapio)}
    style={styles.yellow}
  >
    ⚙️ {mostrarGestaoCardapio ? 'Ocultar Gestão do Cardápio' : 'Abrir Gestão do Cardápio'}
  </button>

  {mostrarGestaoCardapio && (
    <>
      <h2>⚙️ Gestão do Cardápio e Custos</h2>

      <div style={{ ...styles.box, border: itensSemCustoGerencial.length ? '1px solid #ffb300' : '1px solid #2e7d32' }}>
        <strong>💰 Controle de custos</strong><br />
        {itensSemCustoGerencial.length > 0
          ? <>⚠️ <strong>{itensSemCustoGerencial.length} produto(s)</strong> sem custo cadastrado. Use <strong>Editar</strong> para informar o custo unitário.</>
          : <>✅ Todos os produtos ativos possuem custo cadastrado.</>}
      </div>

      <div style={{
        background: '#3b2600',
        border: '1px solid #ffb300',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12
      }}>
        <strong>Cardápio Oficial Mestre do Espeto</strong>
        <p style={{ marginBottom: 8 }}>
          Este botão cria um backup e reconstrói o cardápio oficial. A correção também impede que o sistema recrie automaticamente os itens durante a limpeza, que era a causa da duplicação.
        </p>
        <button onClick={migrarCardapioOficial} style={styles.yellow}>
          🧹 Corrigir / Atualizar Cardápio Oficial
        </button>
      </div>

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
                Venda: R$ {formatarMoedaBR(item.precoVenda ?? item.preco ?? 0)} | Custo: R$ {formatarMoedaBR(item.precoCusto ?? 0)}<br />
                <small>
                  Lucro bruto unit.: R$ {formatarMoedaBR(Number(item.precoVenda ?? item.preco ?? 0) - Number(item.precoCusto ?? 0))}
                  {' • '}Margem: {Number(item.precoVenda ?? item.preco ?? 0) > 0
                    ? (((Number(item.precoVenda ?? item.preco ?? 0) - Number(item.precoCusto ?? 0)) / Number(item.precoVenda ?? item.preco ?? 0)) * 100).toFixed(1).replace('.', ',')
                    : '0,0'}%
                  {Number(item.precoCusto || 0) <= 0 ? ' ⚠️ SEM CUSTO' : ''}
                </small>
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
 )}

{adminLiberado && (
  <div style={styles.card}>
    <button onClick={() => setMostrarGestaoCaixa(!mostrarGestaoCaixa)} style={{ ...styles.green, width: '100%' }}>
      💵 {mostrarGestaoCaixa ? 'Ocultar Gestão de Caixa' : 'Abrir Gestão de Caixa'}
      {caixaDia?.status === 'aberto' ? ' — CAIXA ABERTO' : caixaDia?.status === 'fechado' ? ' — CAIXA FECHADO' : ''}
    </button>

    {mostrarGestaoCaixa && (
      <div style={{ marginTop: 12 }}>
        {!caixaDia && (
          <button onClick={abrirCaixaDia} style={{ ...styles.green, width: '100%', minHeight: 54 }}>🟢 ABRIR CAIXA</button>
        )}

        {caixaDia && (
          <>
            <h2>💵 Gestão de Caixa — {formatarDataBR(hoje())}</h2>
            <div style={styles.box}>Abertura: <strong>R$ {formatarMoedaBR(caixaDia.valorAbertura)}</strong></div>
            <div style={styles.box}>Vendas em dinheiro: <strong>R$ {formatarMoedaBR(vendasDinheiroHoje)}</strong></div>
            <div style={styles.box}>Suprimentos: <strong>R$ {formatarMoedaBR(totalSuprimentosHoje)}</strong></div>
            <div style={styles.box}>Sangrias: <strong>R$ {formatarMoedaBR(totalSangriasHoje)}</strong></div>
            <div style={{ ...styles.box, fontSize: 22 }}>
              VALOR ESPERADO: <strong>R$ {formatarMoedaBR(valorEsperadoCaixa)}</strong>
            </div>

            {caixaDia.status === 'aberto' && (
              <>
                <input value={valorMovimentoCaixa} onChange={e => setValorMovimentoCaixa(e.target.value.replace(/[^0-9,.]/g, ''))} inputMode="decimal" placeholder="Valor da movimentação" style={styles.input} />
                <input value={motivoMovimentoCaixa} onChange={e => setMotivoMovimentoCaixa(e.target.value)} placeholder="Motivo da movimentação" style={styles.input} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => registrarMovimentoCaixa('suprimento')} style={{ ...styles.green, flex: 1 }}>➕ SUPRIMENTO</button>
                  <button onClick={() => registrarMovimentoCaixa('sangria')} style={{ ...styles.red, flex: 1 }}>➖ SANGRIA</button>
                </div>

                <h3 style={{ marginTop: 18 }}>🔒 Fechar Caixa</h3>
                <input value={valorContadoCaixa} onChange={e => setValorContadoCaixa(e.target.value.replace(/[^0-9,.]/g, ''))} inputMode="decimal" placeholder="Valor contado fisicamente" style={styles.input} />
                {valorContadoCaixa && (
                  <div style={styles.box}>
                    Diferença: <strong>R$ {formatarMoedaBR(Number(String(valorContadoCaixa).replace(',', '.')) - valorEsperadoCaixa)}</strong>
                  </div>
                )}
                <button onClick={fecharCaixaDia} style={{ ...styles.red, width: '100%' }}>🔒 FECHAR CAIXA</button>
              </>
            )}

            {caixaDia.status === 'fechado' && (
              <div style={styles.box}>
                🔒 <strong>Caixa fechado</strong><br />
                Esperado: R$ {formatarMoedaBR(caixaDia.valorEsperado)}<br />
                Contado: R$ {formatarMoedaBR(caixaDia.valorContado)}<br />
                Diferença: R$ {formatarMoedaBR(caixaDia.diferenca)}
              </div>
            )}

            {movimentosCaixa.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <h3>Movimentações</h3>
                {movimentosCaixa.map(m => (
                  <div key={m.id} style={styles.box}>
                    {m.tipo === 'suprimento' ? '➕ SUPRIMENTO' : '➖ SANGRIA'} — R$ {formatarMoedaBR(m.valor)}<br />
                    <small>{m.motivo} • {m.responsavel || '-'} • {m.criadoEmISO ? new Date(m.criadoEmISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid #555'
            }}>
              <button
                onClick={limparCaixaTesteDia}
                style={{
                  ...styles.red,
                  width: '100%',
                  minHeight: 50,
                  fontWeight: 900
                }}
              >
                🧹 LIMPAR CAIXA DE TESTE DO DIA
              </button>
              <small style={{ display: 'block', marginTop: 7, opacity: 0.8 }}>
                Apaga somente abertura/fechamento, suprimentos e sangrias de {formatarDataBR(hoje())}.
                Vendas, comandas e histórico de vendas são preservados.
              </small>
            </div>
          </>
        )}
      </div>
    )}
  </div>
)}

{adminLiberado && (
  <div style={styles.card}>
    <h2>📚 Histórico de Fechamentos de Caixa</h2>

    <input
      type="date"
      value={dataHistoricoCaixa}
      onChange={e => setDataHistoricoCaixa(e.target.value)}
      style={styles.input}
    />

    {!caixaHistoricoSelecionado ? (
      <div style={styles.box}>
        Nenhum caixa registrado em <strong>{formatarDataBR(dataHistoricoCaixa)}</strong>.
      </div>
    ) : (
      <>
        <div style={styles.box}>
          <strong>📅 {formatarDataBR(caixaHistoricoSelecionado.data || caixaHistoricoSelecionado.id)}</strong><br />
          Status: <strong>{caixaHistoricoSelecionado.status === 'fechado' ? '🔒 Fechado' : '🟢 Aberto'}</strong>
        </div>

        <div style={styles.box}>
          <strong>💳 Faturamento por forma de pagamento</strong><br />
          💵 Dinheiro: R$ {formatarMoedaBR(dinheiroHistoricoSelecionado)}<br />
          📱 Pix: R$ {formatarMoedaBR(pixHistoricoSelecionado)}<br />
          💳 Cartão: R$ {formatarMoedaBR(cartaoHistoricoSelecionado)}<br />
          <strong>Total clientes: R$ {formatarMoedaBR(faturamentoHistoricoSelecionado)}</strong>
        </div>

        <div style={styles.box}>
          <strong>💰 Conferência da gaveta</strong><br />
          Abertura: R$ {formatarMoedaBR(caixaHistoricoSelecionado.valorAbertura)}<br />
          Suprimentos: R$ {formatarMoedaBR(caixaHistoricoSelecionado.totalSuprimentos)}<br />
          Sangrias: R$ {formatarMoedaBR(caixaHistoricoSelecionado.totalSangrias)}<br />
          Esperado: R$ {formatarMoedaBR(caixaHistoricoSelecionado.valorEsperado)}<br />
          Contado: R$ {formatarMoedaBR(caixaHistoricoSelecionado.valorContado)}<br />
          <strong>
            Diferença: R$ {formatarMoedaBR(caixaHistoricoSelecionado.diferenca)}
          </strong>
        </div>

        <div style={styles.box}>
          <strong>👤 Responsáveis</strong><br />
          Abertura: {caixaHistoricoSelecionado.abertoPor || 'Não informado'}<br />
          Fechamento: {caixaHistoricoSelecionado.fechadoPor || 'Não informado'}
          {caixaHistoricoSelecionado.abertoEmISO && (
            <><br />Aberto às: {new Date(caixaHistoricoSelecionado.abertoEmISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
          )}
          {caixaHistoricoSelecionado.fechadoEmISO && (
            <><br />Fechado às: {new Date(caixaHistoricoSelecionado.fechadoEmISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
          )}
        </div>
      </>
    )}

    {historicoCaixas.length > 0 && (
      <div style={{ marginTop: 12 }}>
        <strong>Últimos caixas registrados</strong>
        {historicoCaixas.slice(0, 7).map(c => (
          <button
            key={c.id}
            onClick={() => setDataHistoricoCaixa(c.data || c.id)}
            style={{
              ...styles.button,
              width: '100%',
              marginTop: 6,
              textAlign: 'left'
            }}
          >
            {formatarDataBR(c.data || c.id)} — {c.status === 'fechado' ? '🔒 Fechado' : '🟢 Aberto'}
            {c.status === 'fechado' ? ` — Diferença R$ ${formatarMoedaBR(c.diferenca)}` : ''}
          </button>
        ))}
      </div>
    )}
  </div>
)}

{adminLiberado && (
  <div style={styles.card}>
    <button
      onClick={() => setMostrarDashboardGerencial(!mostrarDashboardGerencial)}
      style={{ ...styles.green, width: '100%', minHeight: 54, fontWeight: 900 }}
    >
      📊 {mostrarDashboardGerencial ? 'Ocultar Dashboard Gerencial' : 'Abrir Dashboard Gerencial'}
    </button>

    {mostrarDashboardGerencial && (
      <div style={{ marginTop: 14 }}>
        <h2>📊 Dashboard Gerencial — {formatarDataBR(dataRelatorio)}</h2>

        <input
          type="date"
          value={dataRelatorio}
          onChange={e => setDataRelatorio(e.target.value)}
          style={styles.input}
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10,
          marginTop: 12
        }}>
          <div style={styles.box}>
            <small>Faturamento</small><br />
            <strong style={{ fontSize: 22 }}>R$ {formatarMoedaBR(rel.totalVendas)}</strong>
          </div>
          <div style={styles.box}>
            <small>Comandas clientes</small><br />
            <strong style={{ fontSize: 22 }}>{quantidadeComandasClientesGerencial}</strong>
          </div>
          <div style={styles.box}>
            <small>Ticket médio</small><br />
            <strong style={{ fontSize: 22 }}>R$ {formatarMoedaBR(ticketMedioGerencial)}</strong>
          </div>
          <div style={styles.box}>
            <small>Itens registrados</small><br />
            <strong style={{ fontSize: 22 }}>{rel.totalItens}</strong>
          </div>
        </div>

        <div style={{ ...styles.box, marginTop: 12 }}>
          <strong>💳 Formas de pagamento</strong><br />
          💵 Dinheiro: R$ {formatarMoedaBR(rel.caixaData.dinheiro)}<br />
          📱 Pix: R$ {formatarMoedaBR(rel.caixaData.pix)}<br />
          💳 Cartão: R$ {formatarMoedaBR(rel.caixaData.cartao)}
        </div>

        {itensSemCustoGerencial.length > 0 && (
          <div style={{ ...styles.box, border: '1px solid #ffb300', background: '#3b2600' }}>
            ⚠️ <strong>{itensSemCustoGerencial.length} produto(s) ativo(s) estão sem custo cadastrado.</strong><br />
            <small>A margem abaixo ainda é parcial. Corrija os custos em ⚙️ Gestão do Cardápio e Custos.</small>
          </div>
        )}

        <div style={styles.box}>
          <strong>📈 Resultado bruto estimado</strong><br />
          Custo conhecido das vendas: <strong>R$ {formatarMoedaBR(custoVendasGerencial)}</strong><br />
          Margem bruta estimada: <strong>R$ {formatarMoedaBR(margemBrutaGerencial)}</strong><br />
          Margem estimada: <strong>{margemBrutaPercentualGerencial.toFixed(1).replace('.', ',')}%</strong><br />
          <small>
            * Vendas fechadas preservam o custo registrado no momento do fechamento. Registros antigos sem custo continuam estimados.
          </small>
        </div>

        <div style={styles.box}>
          <strong>👥 Consumo interno</strong><br />
          Custo: R$ {formatarMoedaBR(rel.totalConsumoInterno)}<br />
          A repassar: R$ {formatarMoedaBR(rel.totalRepasseInterno)}
        </div>

        <div style={styles.box}>
          <strong>💵 Conferência do caixa</strong><br />
          Status: <strong>{
            caixaGerencialSelecionado?.status === 'fechado'
              ? '🔒 Fechado'
              : caixaGerencialSelecionado?.status === 'aberto'
                ? '🟢 Aberto'
                : 'Sem caixa registrado'
          }</strong><br />
          Suprimentos: R$ {formatarMoedaBR(suprimentosGerencial)}<br />
          Sangrias: R$ {formatarMoedaBR(sangriasGerencial)}<br />
          Diferença: <strong>R$ {formatarMoedaBR(diferencaCaixaGerencial)}</strong>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10
        }}>
          <div style={styles.box}>
            <strong>🏆 Mais vendido</strong><br />
            {produtoMaisVendidoGerencial
              ? <>{produtoMaisVendidoGerencial.nome}<br />{produtoMaisVendidoGerencial.qtd} un.</>
              : 'Sem vendas nesta data'}
          </div>
          <div style={styles.box}>
            <strong>📉 Menos vendido</strong><br />
            {produtoMenosVendidoGerencial
              ? <>{produtoMenosVendidoGerencial.nome}<br />{produtoMenosVendidoGerencial.qtd} un.</>
              : 'Sem vendas nesta data'}
          </div>
        </div>

        {rankingProdutosGerencial.length > 0 && (
          <div style={{ ...styles.box, marginTop: 10 }}>
            <strong>🥇 Ranking de produtos</strong>
            {rankingProdutosGerencial.slice(0, 10).map((p, index) => (
              <div
                key={p.nome}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '7px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <span>{index + 1}. {p.nome}</span>
                <strong>{p.qtd} un. • R$ {formatarMoedaBR(p.total)}</strong>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={imprimirDashboardGerencial}
          style={{ ...styles.green, width: '100%', marginTop: 12, minHeight: 50 }}
        >
          🧾 IMPRIMIR RELATÓRIO GERENCIAL
        </button>
      </div>
    )}
  </div>
)}

{adminLiberado && (
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
)}

{adminLiberado && (
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
)}

{adminLiberado && (
  <div style={styles.card}>
    <button
      onClick={() => setMostrarEstoque(!mostrarEstoque)}
      style={styles.yellow}
    >
      📦 {mostrarEstoque ? 'Ocultar Estoque' : 'Abrir Estoque'}
    </button>

    {mostrarEstoque && (
      <EstoqueProfissional
        estoque={estoque}
        itensCardapio={itensCardapio}
        conferenciaEstoque={rel.conferenciaEstoque}
        reporEstoque={reporEstoque}
        definirEstoque={definirEstoque}
      />
    )}
  </div>
)}

    </div>
  )
}
