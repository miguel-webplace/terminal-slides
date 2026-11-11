<!--
  NOTATION
  ────────────────────────────────────────────────────────────
  • Slides are separated by a line containing only  ---
  • The first block (no @layout) holds global settings.
  • Directives go at the top of a slide, one per line:
      @layout: text | images | big | summary
      @topic:  Name        → groups slides in a folder; changing topic triggers `cd`
      @file:   name.md     → file name shown in `cat` (default: slug of the # title)
  • Body: # title, ## subtitle, paragraphs, - bullets, **bold**, *italic*, `code`
  • images layout: ![caption](assets/x.svg)  → max 2 images are shown
  • big layout:    # 9,000+   then a paragraph as the label
  • summary layout: auto-generated `tree` of all topics and slides
-->
@title: Terminal Slides
@user: grupo-3
@host: BTRFS
@root: Apresentação

---
@layout: text
@file: capa.md

# Sistema de arquivo BTRFS

## Integrantes
- Miguel Andrade da Cruz
- Eric Luigi de Azevedo Rosário
- Luan Ferraz Lemos de Sousa
- Pedro Gregório Zatorre

Prof. Gilberto Branco

**11/26**

---
@layout: summary
@file: summary.md

# Sumário

---

@layout: text
@topic: História
@file: historia.md

# História
- 2007: Conferência USENIX -- b-tree modificada
- 2007: Chris Mason -- Desenvolve sistema de arquivos na Oracle
- 2008: Theodore Ts'o -- Pontos fortes do BTRFS sobre o ext4
- 2009: Linux -- BTRFS faz parte do desenvolvimento do kernel
- 2012: Oracle linux, SUSE Enterprise -- BTRFS entra na branch de produção das distros.

---

@layout: text
@topic: Estrutura interna
@file: architecture.md

# Estrutura interna

- B-tree
- checksum
- defragmentação
- copy-on-write
- subvolumes
- send-receive
- 
---

@layout: text
@topic: Limites técnicos
@file: limits.md

- RAID 5 e 6 não são suportados com estabilidade
- CoW causa fragmentação
- pouca compatibilidade com sistemas não linux

---

@layout: big
@topic: Limites técnicos
@file: max-size-01.md

# 18.446

---

@layout: big
@topic: Limites técnicos
@file: max-size-02.md

# 073.709
---
@layout: big
@topic: Limites técnicos
@file: max-size-03.md

# 551.616

bytes de armazenamento e arquivo (ou 16 Exabytes)
---
@layout: text
@topic: Casos de uso
@file: use-cases.md

# Casos de uso

- Servidores (exemplo: Meta)
- Distros linux
- NAS

---
@layout: text
@topic: Mídias compatíveis
@file: compatible-medias.md

# Mídias compatíveis

- SSD: Ideal
- HDD: Não recomendado devido ao CoW
- Removível: Não recomendado devido compatibilidade de SO
---

@layout: text
@topic: Referências
@file: references.md

# Referências

Diolinux [https://diolinux.com.br/editorial/btrfs-o-sistema-de-arquivos-do-futuro.html]
Dicas-l [https://www.dicas-l.com.br/arquivo/origem_e_desenvolvimento_colaborativo_do_sistema_de_arquivos_btrfs.php]
Wikipedia [https://pt.wikipedia.org/wiki/Btrfs]
Reddit [https://www.reddit.com/r/archlinux/]
Viva o linux [https://www.vivaolinux.com.br/artigo/Apresentando-o-Btrfs-Nova-geracao-de-sistema-de-arquivos-para-GNU-Linux/]
Documentação ofical do BTRFS [Viva o linux [https://btrfs.readthedocs.io/en/latest/]
]
