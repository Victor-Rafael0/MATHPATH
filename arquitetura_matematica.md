
# MathPath 1000: Especificação de Arquitetura Gamificada

Este documento detalha a estrutura lógica e o design de sistemas para uma plataforma de educação matemática de alta escala (1000 níveis).

---

## 1. Modelo de Progressão e Curva de Dificuldade

A progressão do sistema é projetada para manter o usuário no "Estado de Fluxo", equilibrando o desafio matemático com a competência percebida.

### 1.1 Eixos de Dificuldade
A complexidade de um nível ($D_n$) é calculada com base em cinco vetores:
*   **Abstração (A):** Transição do concreto (aritmética) para o simbólico (álgebra) e o conceitual (limites/espaços vetoriais).
*   **Encadeamento Operacional (E):** Número de passos lógicos necessários para a resolução.
*   **Densidade de Variáveis (V):** Quantidade de incógnitas e parâmetros simultâneos.
*   **Interdisciplinaridade (I):** Necessidade de combinar ferramentas de diferentes áreas (ex: Geometria + Álgebra).
*   **Carga Cognitiva (C):** Tempo médio estimado e esforço de memória de curto prazo.

---

## 2. Detalhamento do Módulo 1: Aritmética Primordial (Níveis 1-100)

O Módulo 1 é estruturado em 10 Sprints de 10 níveis cada, focando na transição da intuição para o algoritmo.

| Sprint | Níveis | Nome Técnico | Objetivo Pedagógico |
| :--- | :--- | :--- | :--- |
| **S1** | 1-10 | Ontologia Numérica | Subitização e contagem cardinal profunda. |
| **S2** | 11-20 | Adição Linear | Propriedade aditiva e decomposição numérica. |
| **S3** | 21-30 | Diferencial e Resto | Subtração como distância e complemento. |
| **S4** | 31-40 | Estrutura Posicional | Base 10, ordens e classes decimais. |
| **S5** | 41-50 | Algoritmos de Fluxo | Operações com reagrupamento (vai-um/empresta). |
| **S6** | 51-60 | Escalonamento | Multiplicação como soma iterada e geometria retangular. |
| **S7** | 61-70 | Partição | Divisão, quociente e o conceito de resto/sobra. |
| **S8** | 71-80 | Racionalidade Inicial | Frações unitárias e representação parte-todo. |
| **S9** | 81-90 | Contextualização | Medidas, Moeda e Grandezas do mundo real. |
| **S10** | 91-100 | Síntese Aritmética | Ordem de operações e introdução à balança lógica. |

---

## 3. Sistema de Templates de Problemas (Dynamic Problem Engine)

Para evitar a memorização de respostas, o sistema utiliza **Metamodelos de Exercícios**.

### 3.1 Estrutura do Template
Cada template possui quatro camadas:
1.  **Kernel Matemático:** A fórmula ou propriedade lógica central (ex: $ax + b = c$).
2.  **Gerador de Instâncias:** Algoritmo que seleciona valores para as variáveis dentro de intervalos que garantem soluções elegantes.
3.  **Wrapper de Contexto:** A camada narrativa (problema direto, história aplicada ou prova visual).
4.  **Verificador de Erros Comuns:** Gera alternativas baseadas em falhas lógicas prováveis.

---

## 4. Ecossistema de Engajamento e Economia Interna

O design utiliza mecânicas de RPG para transformar o esforço intelectual em progresso tangível.

### 4.1 Unidades Econômicas
*   **XP (Pontos de Experiência):** Registro cumulativo de esforço e maestria. Não pode ser gasto.
*   **Axiomas (Moeda Hard):** Ganhos por conquistas raras; usados para desbloquear temas cosméticos.
*   **Sigmas (Moeda Soft):** Ganhos por níveis completados; usados para "Dicas de Teoria".

---

## 5. Taxonomia e Metadados Educacionais

Cada um dos 1000 níveis é tagueado para permitir análise de dados e adaptação por IA.

### 5.1 Categorias Taxonômicas
*   **Domínio:** (Aritmética, Álgebra, Geometria, Análise, Estatística).
*   **Habilidade Cognitiva (Bloom):** (Lembrar, Entender, Aplicar, Analisar, Avaliar, Criar).
*   **Nível de Rigor:** (Procedural, Conceitual, Investigativo).
