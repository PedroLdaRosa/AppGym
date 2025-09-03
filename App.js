import { useState } from "react";
import { FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const EQUIPAMENTOS = [
  { id: "supino", nome: "Supino Reto (Peito)" },
  { id: "puxada", nome: "Puxada Frente (Costas)" },
  { id: "agachamento", nome: "Agachamento Livre (Pernas)" },
  { id: "legpress", nome: "Leg Press (Pernas)" },
  { id: "ombros", nome: "Desenvolvimento com Halteres (Ombros)" },
  { id: "rosca", nome: "Rosca Direta (Bíceps)" },
  { id: "triceps", nome: "Tríceps na Corda (Tríceps)" },
  { id: "abdutora", nome: "Cadeira Abdutora (Glúteos/Abd.)" },
  { id: "panturrilha", nome: "Panturrilha Sentado" },
  { id: "remada", nome: "Remada Baixa (Costas)" },
  { id: "crucifixo", nome: "Crucifixo na Máquina (Peito)" },
  { id: "extensora", nome: "Cadeira Extensora (Quadríceps)" },
  { id: "flexora", nome: "Mesa Flexora (Posterior de Coxa)" }
];

// Parâmetros por objetivo
const PARAMS = {
  hipertrofia: { series: [3,4], reps: [8,12], descansoSeg: [60,90] },
  forca: { series: [4,6], reps: [3,6], descansoSeg: [120,180] },
  resistencia: { series: [2,3], reps: [12,20], descansoSeg: [30,60] }
};

function media(a, b) { return Math.round((a + b) / 2); }

function geraPlano(quantExercicios, objetivo) {
  const params = PARAMS[objetivo] || PARAMS.hipertrofia;
  const seriesMed = media(params.series[0], params.series[1]);
  const repsMed = media(params.reps[0], params.reps[1]);
  const descansoMed = media(params.descansoSeg[0], params.descansoSeg[1]);
  const tempoExecSetSeg = 60; // aproximação: ~1 min por série

  // Escolhe equipamentos de forma simples e sem repetição
  const equipamentos = [...EQUIPAMENTOS].sort(() => Math.random() - 0.5).slice(0, quantExercicios);

  // Estimativa de tempo por exercício
  // Tempo = séries * (tempo de execução + descanso) — descanso após última série ignorado para simplificar
  const tempoMedioExercicioMin = Math.round((seriesMed * (tempoExecSetSeg + descansoMed)) / 60);

  const exercicios = equipamentos.map((e) => ({
    equipamento: e.nome,
    series: seriesMed,
    repeticoes: repsMed,
    descansoSegundos: descansoMed,
    tempoMedioMin: tempoMedioExercicioMin
  }));

  const tempoTotal = exercicios.reduce((acc, it) => acc + it.tempoMedioMin, 0);
  return { exercicios, tempoTotalMin: tempoTotal };
}

export default function App() {
  const [qtdUsuarios, setQtdUsuarios] = useState("1");
  const [usuarios, setUsuarios] = useState([{ id: 1, nome: "Usuário 1", objetivo: "hipertrofia", exercicios: "6" }]);
  const [planos, setPlanos] = useState([]);

  const handleQtdUsuariosChange = (v) => {
    const n = Math.max(1, parseInt(v || "1", 10));
    setQtdUsuarios(String(n));
    // Ajusta lista
    setUsuarios((prev) => {
      const arr = [...prev];
      if (n > arr.length) {
        for (let i = arr.length + 1; i <= n; i++) arr.push({ id: i, nome: `Usuário ${i}`, objetivo: "hipertrofia", exercicios: "6" });
      } else if (n < arr.length) {
        arr.length = n;
      }
      return arr;
    });
  };

  const atualizarUsuario = (id, patch) => {
    setUsuarios((prev) => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  };

  const gerar = () => {
    const out = usuarios.map(u => {
      const plano = geraPlano(Math.max(4, Math.min(10, parseInt(u.exercicios || "6", 10))), u.objetivo);
      return { ...u, plano };
    });
    setPlanos(out);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>🏋️‍♂️ App de Treino — Multiusuário</Text>
        <Text style={styles.subtitle}>Defina os dados para <Text style={styles.bold}>X usuários</Text> e gere planos com séries, equipamento e tempo médio.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Quantidade de usuários</Text>
          <TextInput
            value={qtdUsuarios}
            onChangeText={handleQtdUsuariosChange}
            inputMode="numeric"
            style={styles.input}
            placeholder="Ex.: 3"
          />
        </View>

        {usuarios.map((u) => (
          <View style={styles.card} key={u.id}>
            <Text style={styles.h2}>Usuário {u.id}</Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={u.nome}
              onChangeText={(t) => atualizarUsuario(u.id, { nome: t })}
              style={styles.input}
              placeholder="Nome do usuário"
            />

            <Text style={styles.label}>Objetivo</Text>
            <View style={styles.row}>
              {["hipertrofia", "forca", "resistencia"].map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => atualizarUsuario(u.id, { objetivo: opt })}
                  style={[styles.chip, u.objetivo === opt && styles.chipActive]}
                >
                  <Text style={[styles.chipText, u.objetivo === opt && styles.chipTextActive]}>
                    {opt[0].toUpperCase() + opt.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Nº de exercícios (4 a 10)</Text>
            <TextInput
              value={String(u.exercicios)}
              onChangeText={(t) => atualizarUsuario(u.id, { exercicios: t.replace(/[^0-9]/g, "") })}
              inputMode="numeric"
              style={styles.input}
              placeholder="6"
            />
          </View>
        ))}

        <Pressable style={styles.btn} onPress={gerar}>
          <Text style={styles.btnText}>Gerar planos</Text>
        </Pressable>

        {planos.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.h2}>Planos Gerados</Text>
            {planos.map((p) => (
              <View key={p.id} style={styles.planCard}>
                <Text style={styles.planTitle}>{p.nome} — {p.objetivo.toUpperCase()}</Text>
                <Text style={styles.planMeta}>Tempo total estimado: {p.plano.tempoTotalMin} min</Text>
                <FlatList
                  data={p.plano.exercicios}
                  keyExtractor={(item, idx) => p.id + "-" + idx}
                  renderItem={({ item, index }) => (
                    <View style={styles.exerciseRow}>
                      <Text style={styles.exerciseIndex}>{index + 1}.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseName}>{item.equipamento}</Text>
                        <Text style={styles.exerciseMeta}>
                          {item.series} séries · {item.repeticoes} reps · descanso {item.descansoSegundos}s · ~{item.tempoMedioMin} min
                        </Text>
                      </View>
                    </View>
                  )}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1320" },
  scroll: { padding: 16, gap: 12 },
  h1: { fontSize: 24, color: "#e6edf3", fontWeight: "700", marginBottom: 6 },
  h2: { fontSize: 18, color: "#e6edf3", fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#9fb3c8", marginBottom: 8 },
  bold: { fontWeight: "700", color: "#e6edf3" },
  card: { backgroundColor: "#121a2b", padding: 12, borderRadius: 14, gap: 8, borderWidth: 1, borderColor: "#1f2a44" },
  label: { color: "#c8d2e0" },
  input: { backgroundColor: "#0f1725", borderWidth: 1, borderColor: "#354569", color: "#e6edf3", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#30405f", backgroundColor: "#0f1725" },
  chipActive: { backgroundColor: "#27406b", borderColor: "#4b6aa1" },
  chipText: { color: "#c8d2e0" },
  chipTextActive: { color: "#ffffff", fontWeight: "700" },
  btn: { backgroundColor: "#3b82f6", paddingVertical: 14, borderRadius: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  results: { gap: 12 },
  planCard: { backgroundColor: "#121a2b", padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#1f2a44", marginTop: 8 },
  planTitle: { color: "#e6edf3", fontWeight: "700", fontSize: 16 },
  planMeta: { color: "#9fb3c8", marginBottom: 8 },
  exerciseRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#1f2a44" },
  exerciseIndex: { color: "#6ea8fe", width: 18, textAlign: "right", marginTop: 2 },
  exerciseName: { color: "#e6edf3", fontWeight: "600" },
  exerciseMeta: { color: "#9fb3c8" }
});