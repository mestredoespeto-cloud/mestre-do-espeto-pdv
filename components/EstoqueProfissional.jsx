import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/styles'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'

const normalizar = (texto = '') =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const aliasesCategoria = {
  'coracao de frango': 'Espetos',
  'misto especial': 'Espetos Premium Avulso',
  'agua sem gas': 'Bebidas',
  'agua com gas': 'Bebidas',
  'coca-cola lata': 'Bebidas',
  'coca-cola zero lata': 'Bebidas',
  'fanta laranja lata': 'Bebidas',
  'fanta uva lata': 'Bebidas',
  'skol lata 350ml': 'Bebidas',
  'brahma lata 350ml': 'Bebidas',
  'heineken long neck 330ml': 'Bebidas',
  'heineken long neck zero 330ml': 'Bebidas',
  'energetico monster 473ml': 'Bebidas',
  'suco kapo maracuja': 'Bebidas',
  'suco kapo morango': 'Bebidas',
  'original lata 350ml': 'Bebidas',
  'carne bovina': 'Insumos',
  'porcao de arroz 500g': 'Insumos'
}

const categoriaDoProduto = (nome, item) =>
  item?.categoria || aliasesCategoria[normalizar(nome)] || 'Outros'

const nomeVisualProduto = (nome = '') => {
  const n = normalizar(nome)
  if (n === 'misto especial') return 'Misto'
  return nome
}

const categoriaVisual = (categoria = '') => {
  if (categoria === 'Espetos') return '🍢 Espetos Tradicionais'
  if (categoria === 'Espetos Premium Avulso') return '⭐ Espetos Premium'
  if (categoria === 'Executivos') return '🍽️ Monte seu Prato'
  if (categoria === 'Bebidas') return '🥤 Bebidas'
  if (categoria === 'Porções') return '🍟 Porções'
  if (categoria === 'Lanche no Espeto') return '🥖 Lanche'
  if (categoria === 'Combos') return '🎁 Combos'
  if (categoria === 'Insumos') return '🧺 Insumos / Acompanhamentos'
  return categoria || 'Outros'
}

export default function EstoqueProfissional({
  estoque,
  itensCardapio,
  conferenciaEstoque,
  reporEstoque,
  definirEstoque
}) {
  const [buscaEstoque, setBuscaEstoque] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [somenteBaixo, setSomenteBaixo] = useState(false)
  const [estoquesMinimos, setEstoquesMinimos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mestre_estoques_minimos') || '{}')
    } catch {
      return {}
    }
  })
  const [minimosSincronizados, setMinimosSincronizados] = useState(false)

  useEffect(() => {
    const ref = doc(db, 'configuracoes', 'estoqueMinimo')

    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        const dados = snapshot.exists() ? (snapshot.data().valores || {}) : {}

        setEstoquesMinimos(dados)
        localStorage.setItem('mestre_estoques_minimos', JSON.stringify(dados))
        setMinimosSincronizados(true)
      },
      erro => {
        console.error('Erro ao sincronizar estoque mínimo:', erro)
        setMinimosSincronizados(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const salvarEstoqueMinimo = async (nome, atual) => {
    const valor = prompt(`Estoque mínimo para ${nome}:`, String(atual))
    if (valor === null) return

    const numero = Number(valor)
    if (!Number.isFinite(numero) || numero < 0) {
      return alert('Digite um valor válido igual ou maior que zero.')
    }

    const novo = {
      ...estoquesMinimos,
      [nome]: numero
    }

    // Atualiza imediatamente a tela e mantém uma cópia local de segurança.
    setEstoquesMinimos(novo)
    localStorage.setItem('mestre_estoques_minimos', JSON.stringify(novo))

    try {
      await setDoc(
        doc(db, 'configuracoes', 'estoqueMinimo'),
        {
          valores: novo,
          atualizadoEm: serverTimestamp()
        },
        { merge: true }
      )
    } catch (erro) {
      console.error('Erro ao salvar estoque mínimo no Firebase:', erro)
      alert('Não foi possível sincronizar o estoque mínimo. Verifique a conexão e tente novamente.')
    }
  }

  const mapaItens = useMemo(() => {
    const mapa = new Map()
    ;(itensCardapio || []).forEach(item => {
      const nomeEstoque = item.estoqueNome || item.nome
      if (!mapa.has(nomeEstoque)) mapa.set(nomeEstoque, item)
    })
    return mapa
  }, [itensCardapio])

  const itensLegadosOcultos = useMemo(() => new Set([
    'espeto de almondega',
    'frango',
    'lanche',
    'lombo',
    'combo 3 original',
    'executivo mestre classico 1',
    'executivo mestre classico 2',
    'suco del valle laranja 450ml',
    'suco del valle uva 450ml',
    'porcao de vinagrete 350g'
  ]), [])

  const categorias = useMemo(() => {
    const cats = new Set()
    Object.keys(estoque || {})
      .filter(nome => !itensLegadosOcultos.has(normalizar(nome)))
      .forEach(nome => {
        cats.add(categoriaDoProduto(nome, mapaItens.get(nome)))
      })
    return ['Todos', ...Array.from(cats).sort()]
  }, [estoque, mapaItens, itensLegadosOcultos])

  const produtos = useMemo(() => Object.keys(estoque || {})
    .filter(nome => !itensLegadosOcultos.has(normalizar(nome)))
    .map(nome => {
    const item = mapaItens.get(nome)
    const real = Number(estoque[nome] ?? 0)
    const categoria = categoriaDoProduto(nome, item)
    const minimo = Number(
      estoquesMinimos[nome] ??
      item?.estoqueMinimo ??
      5
    )
    return { nome, real, categoria, minimo, baixo: real <= minimo, zerado: real <= 0 }
  }).filter(prod => {
    const termo = buscaEstoque.trim().toLowerCase()
    return (!termo ||
      prod.nome.toLowerCase().includes(termo) ||
      nomeVisualProduto(prod.nome).toLowerCase().includes(termo)) &&
      (categoriaAtiva === 'Todos' || prod.categoria === categoriaAtiva) &&
      (!somenteBaixo || prod.baixo)
  }).sort((a,b) => {
    if (a.zerado !== b.zerado) return a.zerado ? -1 : 1
    if (a.baixo !== b.baixo) return a.baixo ? -1 : 1
    return a.nome.localeCompare(b.nome)
  }), [estoque, mapaItens, buscaEstoque, categoriaAtiva, somenteBaixo, itensLegadosOcultos, estoquesMinimos])

  const resumo = useMemo(() => {
    const nomes = Object.keys(estoque || {})
      .filter(nome => !itensLegadosOcultos.has(normalizar(nome)))
    let baixos = 0
    let zerados = 0
    nomes.forEach(nome => {
      const minimo = Number(
        estoquesMinimos[nome] ??
        mapaItens.get(nome)?.estoqueMinimo ??
        5
      )
      const qtd = Number(estoque[nome] ?? 0)
      if (qtd <= minimo) baixos++
      if (qtd <= 0) zerados++
    })
    return { total: nomes.length, baixos, zerados }
  }, [estoque, mapaItens, itensLegadosOcultos, estoquesMinimos])

  const conferenciaMap = useMemo(() => {
    const mapa = new Map()
    ;(conferenciaEstoque || []).forEach(i => mapa.set(i.produto, i))
    return mapa
  }, [conferenciaEstoque])

  return (
    <div style={{ marginTop: 15 }}>
      <h2>📦 Estoque Profissional</h2>

      <div style={{
        background: '#1f2a22',
        border: '1px solid #3f6b49',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15
      }}>
        <strong>🛡️ Classificação segura do estoque</strong>
        <div style={{ marginTop: 6, color: '#ccc' }}>
          Produtos atuais e insumos foram separados por categoria. O estoque mínimo configurado pelo
          botão “⚙️ Mínimo” agora é sincronizado pelo Firebase para os aparelhos conectados.
          O valor padrão continua sendo 5 quando nenhum mínimo específico tiver sido definido.
          <div style={{ marginTop: 7, fontWeight: 'bold' }}>
            {minimosSincronizados
              ? '☁️ Mínimos sincronizados'
              : '⚠️ Aguardando sincronização dos mínimos'}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:15 }}>
        <div style={styles.box}><strong>Total de produtos</strong><div style={{fontSize:24,marginTop:6}}>{resumo.total}</div></div>
        <div style={styles.box}><strong>Estoque baixo</strong><div style={{fontSize:24,marginTop:6}}>{resumo.baixos}</div></div>
        <div style={styles.box}><strong>Zerados</strong><div style={{fontSize:24,marginTop:6}}>{resumo.zerados}</div></div>
      </div>

      <input
        placeholder="🔎 Buscar produto no estoque..."
        value={buscaEstoque}
        onChange={e=>setBuscaEstoque(e.target.value)}
        style={styles.input}
      />

      <div style={{display:'flex',gap:8,overflowX:'auto',marginBottom:12,paddingBottom:5}}>
        {categorias.map(cat=>(
          <button
            key={cat}
            onClick={()=>setCategoriaAtiva(cat)}
            style={{
              minWidth:135,padding:'10px 12px',borderRadius:9,
              border:categoriaAtiva===cat?'2px solid #ffb300':'1px solid #555',
              background:categoriaAtiva===cat?'#3b2600':'#2b2b2b',
              color:'#fff',cursor:'pointer'
            }}
          >
            {cat==='Todos'?'📦 Todos':categoriaVisual(cat)}
          </button>
        ))}
      </div>

      <label style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:15,cursor:'pointer'}}>
        <input type="checkbox" checked={somenteBaixo} onChange={e=>setSomenteBaixo(e.target.checked)} />
        Mostrar somente estoque baixo / zerado
      </label>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10}}>
        {produtos.map(prod=>{
          const conf=conferenciaMap.get(prod.nome)
          return (
            <div key={prod.nome} style={{
              background:'#222',
              border:prod.zerado?'2px solid #d50000':prod.baixo?'2px solid #ffb300':'1px solid #444',
              borderRadius:10,padding:12
            }}>
              <div style={{display:'flex',justifyContent:'space-between',gap:10}}>
                <div>
                  <strong>{nomeVisualProduto(prod.nome)}</strong>
                  <small style={{display:'block',marginTop:4,color:'#bbb'}}>{categoriaVisual(prod.categoria)}</small>
                </div>
                <div style={{minWidth:54,textAlign:'center',fontSize:22,fontWeight:'bold',color:prod.zerado?'#ff5252':prod.baixo?'#ffd166':'#a5d6a7'}}>{prod.real}</div>
              </div>

              <div style={{marginTop:8}}>
                {prod.zerado && <strong style={{color:'#ff5252'}}>⛔ SEM ESTOQUE</strong>}
                {!prod.zerado && prod.baixo && <strong style={{color:'#ffd166'}}>⚠️ Estoque baixo</strong>}
                {!prod.baixo && <strong style={{color:'#a5d6a7'}}>✅ Estoque normal</strong>}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginTop: 7
              }}>
                <small style={{ color: '#bbb' }}>
                  Estoque mínimo: <strong>{prod.minimo}</strong>
                </small>

                <button
                  onClick={() => salvarEstoqueMinimo(prod.nome, prod.minimo)}
                  style={{
                    padding: '6px 9px',
                    borderRadius: 7,
                    border: '1px solid #666',
                    background: '#333',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️ Mínimo
                </button>
              </div>

              {conf && <small style={{display:'block',marginTop:8,color:'#bbb'}}>
                Inicial: {conf.inicial} | Saída: {conf.saida} | Esperado: {conf.esperado}<br/>
                Diferença: {conf.diferenca} | Perda: R$ {Number(conf.valorDiferenca||0).toFixed(2)}
              </small>}

              <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
                <button onClick={()=>reporEstoque(prod.nome)} style={styles.repor}>➕ Repor</button>
                <button onClick={()=>definirEstoque(prod.nome)} style={styles.repor}>✏️ Ajustar</button>
              </div>
            </div>
          )
        })}
      </div>

      {produtos.length===0 && <div style={{...styles.box,marginTop:12}}>Nenhum produto encontrado com os filtros atuais.</div>}
    </div>
  )
}
