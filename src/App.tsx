import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Modal,
  Alert,
  Linking,
  Share,
  StatusBar,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// =========================================================================
// PALETA DE CORES OFICIAL AUTOGOLD (PRETO E DOURADO NOBRE)
// =========================================================================
const COLORS = {
  background: '#0D0D0D',
  card: '#1E1E1E',
  cardSubtle: '#141414',
  border: '#2C2C2C',
  gold: '#D4AF37',
  goldLight: '#FFD700',
  goldMuted: '#997D24',
  goldSoft: '#F5E6BE',
  textWhite: '#FFFFFF',
  textGray: '#A0A0A0',
  textMuted: '#666666',
  green: '#10B981',
  red: '#EF4444',
  inputBg: '#121212'
};

// LISTA DE PEÇAS AUTOMOTIVAS
const VEHICLE_PARTS = [
  'Capô Dianteiro',
  'Parachoque Dianteiro',
  'Parachoque Traseiro',
  'Paralama Dianteiro Esquerdo',
  'Paralama Dianteiro Direito',
  'Paralama Traseiro Esquerdo',
  'Paralama Traseiro Direito',
  'Porta Dianteira Esquerda',
  'Porta Dianteira Direita',
  'Porta Traseira Esquerda',
  'Porta Traseira Direita',
  'Teto',
  'Tampa Traseira (Porta-malas)',
  'Lateral Traseira',
  'Retrovisor',
  'Soleira'
];

export default function App() {
  // -------------------------------------------------------------
  // ESTADO DE AUTENTICAÇÃO E LICENÇA
  // -------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLicensed, setIsLicensed] = useState(true);
  const [licenseKey, setLicenseKey] = useState('GOLD-2026-VIP');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');

  // -------------------------------------------------------------
  // NAVEGAÇÃO ENTRE TELAS
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('orcamentos'); // 'orcamentos' | 'novo' | 'caixa' | 'config'

  // -------------------------------------------------------------
  // CONFIGURAÇÕES DA OFICINA (WHITE-LABEL)
  // -------------------------------------------------------------
  const [workshopConfig, setWorkshopConfig] = useState({
    workshopName: 'AutoGold Centro Automotivo',
    ownerName: 'Marcio Silva',
    address: 'Av. das Indústrias Automotivas, 1500',
    phone: '11998765432',
    pixKey: '45.123.890/0001-99',
    pixKeyType: 'CNPJ',
    pixBeneficiary: 'AutoGold Centro Automotivo Ltda',
    logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&auto=format&fit=crop&q=80',
    profitMargin: 35,
    pricing: {
      bodywork: { pequena: 180, media: 350, grande: 650, troca: 220 },
      paintPerPart: 380,
      polishing: {
        comercial: { fullVehicle: 350, perPart: 60 },
        tecnico: { fullVehicle: 780, perPart: 110 },
        vitrificacao: { fullVehicle: 1450, perPart: 200 }
      },
      materials: {
        paintL: 160,     // Lata 900ml
        clearcoatL: 180, // Kit 900ml
        primerL: 95,     // Lata 900ml
        puttyKg: 55      // Lata 1000g
      }
    }
  });

  // -------------------------------------------------------------
  // BANCO DE DADOS LOCAL DE ORÇAMENTOS
  // -------------------------------------------------------------
  const [budgets, setBudgets] = useState([
    {
      id: 'orc-01',
      code: 'AG-2026-001',
      createdAt: '03/09/2026',
      clientName: 'Carlos Eduardo Mendes',
      clientPhone: '11987654321',
      vehiclePlate: 'BRA-2E19',
      vehicleModel: 'BMW Série 3 320i M Sport',
      vehicleYear: '2023',
      vehicleColor: 'Preto Safira',
      parts: [
        {
          id: 'p-1',
          name: 'Parachoque Dianteiro',
          severity: 'media',
          bodyworkCost: 350,
          paintCost: 380,
          materialsCost: 95.8,
          polishingType: 'tecnico',
          polishingCost: 110,
          subtotal: 935.8
        }
      ],
      globalPolishing: { type: 'vitrificacao', cost: 1450 },
      photos: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80'
      ],
      totalLaborCost: 730,
      totalMaterialsCost: 95.8,
      totalPolishingCost: 1560,
      totalFinal: 3220.83,
      downPayment50: 1610.41,
      status: 'aprovado'
    }
  ]);

  // -------------------------------------------------------------
  // FLUXO DE CAIXA DA OFICINA
  // -------------------------------------------------------------
  const [cashFlow, setCashFlow] = useState([
    {
      id: 'cf-1',
      type: 'entrada',
      description: 'Sinal 50% - Orçamento AG-2026-001 (BMW 320i)',
      category: 'Sinal de Orçamento',
      amount: 1610.41,
      date: '03/09/2026'
    },
    {
      id: 'cf-2',
      type: 'saida',
      description: 'Lote Tintas e Verniz Alto Sólidos',
      category: 'Insumos / Tintas',
      amount: 580.0,
      date: '03/09/2026'
    }
  ]);

  // -------------------------------------------------------------
  // ESTADOS DO FORMULÁRIO DE NOVO ORÇAMENTO
  // -------------------------------------------------------------
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newParts, setNewParts] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [hasGlobalPolishing, setHasGlobalPolishing] = useState(false);
  const [globalPolishingType, setGlobalPolishingType] = useState('tecnico'); // 'comercial' | 'tecnico' | 'vitrificacao'
  const [newProfitMargin, setNewProfitMargin] = useState('35');

  // Adicionar peça no orçamento
  const [selectedPart, setSelectedPart] = useState(VEHICLE_PARTS[0]);
  const [damageSeverity, setDamageSeverity] = useState('media'); // 'pequena' | 'media' | 'grande' | 'troca'
  const [hasBodywork, setHasBodywork] = useState(true);
  const [hasPaint, setHasPaint] = useState(true);
  const [partPolishingType, setPartPolishingType] = useState('nenhum'); // 'nenhum' | 'comercial' | 'tecnico' | 'vitrificacao'
  const [paintConsumedMl, setPaintConsumedMl] = useState('200');
  const [clearcoatConsumedMl, setClearcoatConsumedMl] = useState('180');
  const [primerConsumedMl, setPrimerConsumedMl] = useState('100');
  const [puttyConsumedG, setPuttyConsumedG] = useState('150');

  // Modal de Detalhes de Orçamento
  const [selectedBudgetModal, setSelectedBudgetModal] = useState(null);

  // Modal de Novo Lançamento de Caixa
  const [isCashFlowModalOpen, setIsCashFlowModalOpen] = useState(false);
  const [cfType, setCfType] = useState('entrada');
  const [cfDesc, setCfDesc] = useState('');
  const [cfAmount, setCfAmount] = useState('');
  const [cfCategory, setCfCategory] = useState('Sinal de Orçamento');

  // -------------------------------------------------------------
  // FUNÇÃO: ATIVAÇÃO DE LICENÇA (ZERO TERMOS TÉCNICOS)
  // -------------------------------------------------------------
  const handleActivateLicense = () => {
    const key = licenseInput.trim().toUpperCase();
    if (!key) {
      Alert.alert('Atenção', 'Digite a chave de licença fornecida.');
      return;
    }
    setLicenseKey(key);
    setIsLicensed(true);
    setIsActivatingLicense(false);
    setIsAuthenticated(true);
    Alert.alert('Sucesso!', 'Licença Vitalícia Ativa no seu dispositivo.');
  };

  const handleLogin = () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert('Atenção', 'Preencha seu E-mail e Senha.');
      return;
    }
    setIsAuthenticated(true);
  };

  // -------------------------------------------------------------
  // FUNÇÃO: SELEÇÃO DE MÚLTIPLAS FOTOS (EXPO IMAGE PICKER)
  // -------------------------------------------------------------
  const pickMultiplePhotos = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão Necessária', 'Permita o acesso à galeria para anexar fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        setNewPhotos((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      Alert.alert('Erro ao carregar fotos', 'Não foi possível selecionar fotos.');
    }
  };

  const removePhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------
  // FUNÇÃO: ADICIONAR PEÇA AO ORÇAMENTO COM CONSUMO FRACIONADO
  // -------------------------------------------------------------
  const handleAddPartToBudget = () => {
    const bPrice = hasBodywork ? workshopConfig.pricing.bodywork[damageSeverity] : 0;
    const pPrice = hasPaint ? workshopConfig.pricing.paintPerPart : 0;

    // Cálculo fracionado real de insumos
    const pMl = parseFloat(paintConsumedMl) || 0;
    const cMl = parseFloat(clearcoatConsumedMl) || 0;
    const prMl = parseFloat(primerConsumedMl) || 0;
    const puG = parseFloat(puttyConsumedG) || 0;

    const paintCost = (pMl / 900) * workshopConfig.pricing.materials.paintL;
    const clearcoatCost = (cMl / 900) * workshopConfig.pricing.materials.clearcoatL;
    const primerCost = (prMl / 900) * workshopConfig.pricing.materials.primerL;
    const puttyCost = (puG / 1000) * workshopConfig.pricing.materials.puttyKg;
    const materialsCost = hasPaint || hasBodywork ? paintCost + clearcoatCost + primerCost + puttyCost : 0;

    // Polimento na peça individual
    let polCost = 0;
    if (partPolishingType !== 'nenhum') {
      polCost = workshopConfig.pricing.polishing[partPolishingType].perPart;
    }

    const subtotal = bPrice + pPrice + materialsCost + polCost;

    const partObj = {
      id: `part-${Date.now()}`,
      name: selectedPart,
      severity: damageSeverity,
      hasBodywork,
      bodyworkCost: bPrice,
      hasPaint,
      paintCost: pPrice,
      materialsCost,
      polishingType: partPolishingType === 'nenhum' ? null : partPolishingType,
      polishingCost: polCost,
      subtotal
    };

    setNewParts((prev) => [...prev, partObj]);
    Alert.alert('Peça Adicionada', `${selectedPart} incluída no orçamento.`);
  };

  const removePart = (id) => {
    setNewParts((prev) => prev.filter((p) => p.id !== id));
  };

  // -------------------------------------------------------------
  // FUNÇÃO: SALVAR ORÇAMENTO
  // -------------------------------------------------------------
  const handleSaveBudget = () => {
    if (!newClientName.trim() || !newModel.trim()) {
      Alert.alert('Dados Incompletos', 'Informe ao menos o nome do cliente e o modelo do veículo.');
      return;
    }

    if (newParts.length === 0 && !hasGlobalPolishing) {
      Alert.alert('Atenção', 'Adicione pelo menos uma peça ou selecione o polimento do veículo.');
      return;
    }

    const labor = newParts.reduce((acc, p) => acc + p.bodyworkCost + p.paintCost, 0);
    const materials = newParts.reduce((acc, p) => acc + p.materialsCost, 0);
    const partsPol = newParts.reduce((acc, p) => acc + p.polishingCost, 0);
    const globPol = hasGlobalPolishing ? workshopConfig.pricing.polishing[globalPolishingType].fullVehicle : 0;
    const totalPol = partsPol + globPol;

    const subtotal = labor + materials + totalPol;
    const margin = parseFloat(newProfitMargin) || 35;
    const totalFinal = subtotal + (subtotal * margin) / 100;
    const downPayment50 = totalFinal * 0.5;

    const code = `AG-2026-${Math.floor(100 + Math.random() * 900)}`;

    const budgetItem = {
      id: `orc-${Date.now()}`,
      code,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      clientName: newClientName,
      clientPhone: newClientPhone,
      vehiclePlate: newPlate.toUpperCase(),
      vehicleModel: newModel,
      vehicleYear: newYear,
      vehicleColor: newColor,
      parts: newParts,
      globalPolishing: hasGlobalPolishing
        ? { type: globalPolishingType, cost: globPol }
        : null,
      photos: newPhotos,
      totalLaborCost: labor,
      totalMaterialsCost: materials,
      totalPolishingCost: totalPol,
      totalFinal,
      downPayment50,
      status: 'pendente'
    };

    setBudgets((prev) => [budgetItem, ...prev]);

    // Limpa campos
    setNewClientName('');
    setNewClientPhone('');
    setNewPlate('');
    setNewModel('');
    setNewYear('');
    setNewColor('');
    setNewParts([]);
    setNewPhotos([]);
    setHasGlobalPolishing(false);

    Alert.alert('Sucesso!', `Orçamento ${code} gravado com sucesso.`);
    setActiveTab('orcamentos');
  };

  // -------------------------------------------------------------
  // FUNÇÃO: GERAR & ENVIAR VIA WHATSAPP (COM SINAL DE 50% E PIX)
  // -------------------------------------------------------------
  const sendWhatsAppBudget = (budget) => {
    const partsDesc = budget.parts
      .map((p) => {
        let items = [];
        if (p.bodyworkCost > 0) items.push(`• Funilaria (${p.severity})`);
        if (p.paintCost > 0) items.push(`• Pintura`);
        if (p.polishingCost > 0) items.push(`• Polimento ${p.polishingType}`);
        return `🚗 *${p.name}*:\n  ${items.join('\n  ')}`;
      })
      .join('\n\n');

    let polGlob = '';
    if (budget.globalPolishing) {
      const pLabel =
        budget.globalPolishing.type === 'comercial'
          ? 'Polimento Comercial (Carro Todo)'
          : budget.globalPolishing.type === 'tecnico'
          ? 'Polimento Técnico Completo'
          : 'Cristalização / Vitrificação Cerâmica';
      polGlob = `\n✨ *Estética Veículo Completo:*\n• ${pLabel} - R$ ${budget.globalPolishing.cost.toFixed(2)}\n`;
    }

    const text = `✨ *ORÇAMENTO DE REPARO & ESTÉTICA* ✨
*${workshopConfig.workshopName.toUpperCase()}*
${workshopConfig.address}
WhatsApp: ${workshopConfig.phone}
-----------------------------------------
📋 *Orçamento Nº:* ${budget.code}
📅 *Data:* ${budget.createdAt}

👤 *Cliente:* ${budget.clientName}
🚘 *Veículo:* ${budget.vehicleModel} (${budget.vehicleYear || 'N/D'})
🎨 *Cor:* ${budget.vehicleColor || 'N/D'}
🔢 *Placa:* ${budget.vehiclePlate || 'N/D'}
-----------------------------------------
🛠️ *SERVIÇOS DISCRIMINADOS:*

${partsDesc}
${polGlob}
-----------------------------------------
💰 *VALOR TOTAL DO SERVIÇO:* *R$ ${budget.totalFinal.toFixed(2)}*
🔒 *Sinal de 50% para Início:* *R$ ${budget.downPayment50.toFixed(2)}*

💳 *DADOS PARA PAGAMENTO PIX:*
• Chave (${workshopConfig.pixKeyType}): *${workshopConfig.pixKey}*
• Favorecido: *${workshopConfig.pixBeneficiary}*

Envie o comprovante do sinal de 50% para iniciarmos o reparo do seu veículo! 🤝`;

    const encoded = encodeURIComponent(text);
    const phoneClean = (budget.clientPhone || '').replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    Linking.openURL(url).catch(() => {
      Share.share({ message: text });
    });
  };

  // -------------------------------------------------------------
  // FUNÇÃO: REGISTRAR SINAL NO FLUXO DE CAIXA
  // -------------------------------------------------------------
  const handleRegisterBudgetDeposit = (budget) => {
    const entry = {
      id: `cf-${Date.now()}`,
      type: 'entrada',
      description: `Sinal 50% - Orçamento ${budget.code} (${budget.vehicleModel})`,
      category: 'Sinal de Orçamento',
      amount: budget.downPayment50,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setCashFlow((prev) => [entry, ...prev]);

    // Atualiza status do orçamento para aprovado
    setBudgets((prev) =>
      prev.map((b) => (b.id === budget.id ? { ...b, status: 'aprovado' } : b))
    );

    Alert.alert('Caixa Atualizado', `Recebimento de R$ ${budget.downPayment50.toFixed(2)} lançado no fluxo de caixa!`);
    setSelectedBudgetModal(null);
  };

  // -------------------------------------------------------------
  // TELA DE ENTRADA & LICENCIAMENTO (LIMPA E DIRETA)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authLogoBox}>
            <Text style={styles.authLogoText}>AG</Text>
          </View>
          <Text style={styles.authTitle}>
            AUTO<Text style={{ color: COLORS.gold }}>GOLD</Text>
          </Text>
          <Text style={styles.authSubtitle}>Gestão de Funilaria, Pintura & Estética</Text>

          <View style={styles.authCard}>
            {!isActivatingLicense ? (
              <View>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="exemplo@suaoficina.com.br"
                  placeholderTextColor={COLORS.textMuted}
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={authPassword}
                  onChangeText={setAuthPassword}
                />

                <TouchableOpacity style={styles.goldButton} onPress={handleLogin}>
                  <Text style={styles.goldButtonText}>Entrar no Aplicativo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.activateLink}
                  onPress={() => setIsActivatingLicense(true)}
                >
                  <Text style={styles.activateLinkText}>🔑 Ativar Licença</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.cardHeaderTitle}>Ativação de Licença Vitalícia</Text>
                <Text style={styles.cardHeaderSub}>
                  Digite a chave de ativação para desbloquear o uso definitivo no seu dispositivo.
                </Text>

                <Text style={styles.label}>Chave de Licença</Text>
                <TextInput
                  style={[styles.input, { letterSpacing: 2, fontFamily: 'monospace' }]}
                  placeholder="Ex: GOLD-2026-VIP"
                  placeholderTextColor={COLORS.textMuted}
                  value={licenseInput}
                  onChangeText={setLicenseInput}
                  autoCapitalize="characters"
                />

                <TouchableOpacity style={styles.goldButton} onPress={handleActivateLicense}>
                  <Text style={styles.goldButtonText}>Validar e Liberar Acesso</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.activateLink}
                  onPress={() => setIsActivatingLicense(false)}
                >
                  <Text style={[styles.activateLinkText, { color: COLORS.textGray }]}>
                    Voltar ao Login
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.authFooter}>
            AutoGold &copy; {new Date().getFullYear()} • Sistema com Licença Vitalícia
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // TELA PRINCIPAL (APÓS LOGIN / ATIVAÇÃO)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* CABEÇALHO SUPERIOR */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.headerMiniLogo}>
            <Text style={styles.headerMiniLogoText}>AG</Text>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>
              AUTO<Text style={{ color: COLORS.gold }}>GOLD</Text>
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {workshopConfig.workshopName}
            </Text>
          </View>
        </View>

        <View style={styles.licenseBadge}>
          <Text style={styles.licenseBadgeText}>★ Licença Vitalícia Ativa</Text>
        </View>
      </View>

      {/* CORPO DE CONTEÚDO BASEADO NA ABA SELECIONADA */}
      <View style={{ flex: 1 }}>
        {/* ========================================================= */}
        {/* ABA 1: LISTAGEM DE ORÇAMENTOS */}
        {/* ========================================================= */}
        {activeTab === 'orcamentos' && (
          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Orçamentos Emitidos</Text>
              <TouchableOpacity
                style={styles.miniGoldBtn}
                onPress={() => setActiveTab('novo')}
              >
                <Text style={styles.miniGoldBtnText}>+ Novo</Text>
              </TouchableOpacity>
            </View>

            {budgets.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.budgetCard}
                onPress={() => setSelectedBudgetModal(item)}
              >
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetCode}>{item.code}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      item.status === 'aprovado'
                        ? { backgroundColor: '#064E3B', color: '#6EE7B7' }
                        : { backgroundColor: '#451A03', color: '#FCD34D' }
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.budgetClient}>{item.clientName}</Text>
                <Text style={styles.budgetVehicle}>
                  🚗 {item.vehicleModel} ({item.vehiclePlate})
                </Text>

                <View style={styles.budgetCardFooter}>
                  <View>
                    <Text style={styles.budgetLabel}>Sinal 50%</Text>
                    <Text style={styles.budgetSmallValue}>
                      R$ {item.downPayment50.toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.budgetLabel, { color: COLORS.gold }]}>Valor Total</Text>
                    <Text style={styles.budgetTotalValue}>
                      R$ {item.totalFinal.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => setSelectedBudgetModal(item)}
                  >
                    <Text style={styles.cardActionBtnText}>Ver Detalhes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cardActionBtn, { backgroundColor: '#059669' }]}
                    onPress={() => sendWhatsAppBudget(item)}
                  >
                    <Text style={[styles.cardActionBtnText, { color: '#FFF' }]}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* ABA 2: NOVO ORÇAMENTO (CÁLCULO FRACIONADO, POLIMENTO & FOTOS) */}
        {/* ========================================================= */}
        {activeTab === 'novo' && (
          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 120 }}>
            <Text style={styles.sectionTitle}>Novo Orçamento de Reparo</Text>
            <Text style={styles.sectionDesc}>
              Funilaria, Pintura, Polimento e Consumo Real de Insumos
            </Text>

            {/* BLOCO 1: CLIENTE E VEÍCULO */}
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>1. Dados do Cliente e Veículo</Text>

              <Text style={styles.label}>Nome do Cliente *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Roberto Alcantara"
                placeholderTextColor={COLORS.textMuted}
                value={newClientName}
                onChangeText={setNewClientName}
              />

              <Text style={styles.label}>WhatsApp / Celular</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 11987654321"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={newClientPhone}
                onChangeText={setNewClientPhone}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Modelo do Carro *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Corolla XEi"
                    placeholderTextColor={COLORS.textMuted}
                    value={newModel}
                    onChangeText={setNewModel}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Placa</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: BRA-1234"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="characters"
                    value={newPlate}
                    onChangeText={setNewPlate}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Ano</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 2023"
                    placeholderTextColor={COLORS.textMuted}
                    value={newYear}
                    onChangeText={setNewYear}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Cor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Prata Supernova"
                    placeholderTextColor={COLORS.textMuted}
                    value={newColor}
                    onChangeText={setNewColor}
                  />
                </View>
              </View>
            </View>

            {/* BLOCO 2: PEÇAS & CÁLCULO FRACIONADO */}
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>2. Adicionar Peça e Gravidade da Avaria</Text>

              <Text style={styles.label}>Peça Selecionada</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {VEHICLE_PARTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setSelectedPart(p)}
                    style={[
                      styles.chip,
                      selectedPart === p && { backgroundColor: COLORS.gold, borderColor: COLORS.gold }
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPart === p && { color: '#000', fontWeight: 'bold' }
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Gravidade do Dano</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                {['pequena', 'media', 'grande', 'troca'].map((sev) => (
                  <TouchableOpacity
                    key={sev}
                    onPress={() => setDamageSeverity(sev)}
                    style={[
                      styles.sevBtn,
                      damageSeverity === sev && { backgroundColor: COLORS.gold, borderColor: COLORS.gold }
                    ]}
                  >
                    <Text
                      style={[
                        styles.sevBtnText,
                        damageSeverity === sev && { color: '#000', fontWeight: 'bold' }
                      ]}
                    >
                      {sev.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SERVIÇOS NA PEÇA */}
              <View style={styles.switchRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, hasBodywork && styles.toggleBtnActive]}
                  onPress={() => setHasBodywork(!hasBodywork)}
                >
                  <Text style={styles.toggleBtnText}>
                    {hasBodywork ? '✓ Funilaria Incluída' : '+ Incluir Funilaria'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, hasPaint && styles.toggleBtnActive]}
                  onPress={() => setHasPaint(!hasPaint)}
                >
                  <Text style={styles.toggleBtnText}>
                    {hasPaint ? '✓ Pintura Incluída' : '+ Incluir Pintura'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CONSUMO FRACIONADO DE INSUMOS */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                Insumos Fracionados (Consumo Real vs Embalagem)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Tinta (ml)</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    value={paintConsumedMl}
                    onChangeText={setPaintConsumedMl}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Verniz (ml)</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    value={clearcoatConsumedMl}
                    onChangeText={setClearcoatConsumedMl}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Primer (ml)</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    value={primerConsumedMl}
                    onChangeText={setPrimerConsumedMl}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Massa (g)</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    value={puttyConsumedG}
                    onChangeText={setPuttyConsumedG}
                  />
                </View>
              </View>

              {/* POLIMENTO INDIVIDUAL NA PEÇA */}
              <Text style={styles.label}>Polimento Nesta Peça (Opcional)</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                {[
                  { id: 'nenhum', label: 'Nenhum' },
                  { id: 'comercial', label: 'Comercial' },
                  { id: 'tecnico', label: 'Técnico' },
                  { id: 'vitrificacao', label: 'Vitrificação' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setPartPolishingType(item.id)}
                    style={[
                      styles.polBtn,
                      partPolishingType === item.id && {
                        backgroundColor: COLORS.gold,
                        borderColor: COLORS.gold
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.polBtnText,
                        partPolishingType === item.id && { color: '#000', fontWeight: 'bold' }
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.addPartBtn} onPress={handleAddPartToBudget}>
                <Text style={styles.addPartBtnText}>+ Inserir Esta Peça no Orçamento</Text>
              </TouchableOpacity>

              {/* LISTA DE PEÇAS ADICIONADAS */}
              {newParts.length > 0 && (
                <View style={{ marginTop: 15 }}>
                  <Text style={[styles.label, { color: COLORS.gold }]}>
                    Peças no Orçamento ({newParts.length}):
                  </Text>
                  {newParts.map((p) => (
                    <View key={p.id} style={styles.addedPartRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>
                          {p.name} ({p.severity})
                        </Text>
                        <Text style={{ color: COLORS.textGray, fontSize: 11 }}>
                          MO: R$ {(p.bodyworkCost + p.paintCost).toFixed(2)} | Insumos: R${' '}
                          {p.materialsCost.toFixed(2)}
                          {p.polishingCost > 0 ? ` | Polimento: R$ ${p.polishingCost}` : ''}
                        </Text>
                      </View>
                      <Text style={{ color: COLORS.goldLight, fontWeight: 'bold', marginRight: 10 }}>
                        R$ {p.subtotal.toFixed(2)}
                      </Text>
                      <TouchableOpacity onPress={() => removePart(p.id)}>
                        <Text style={{ color: COLORS.red, fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* BLOCO 3: MÓDULO GERAL DE POLIMENTO E ESTÉTICA (VEÍCULO COMPLETO) */}
            <View style={styles.formCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.formCardTitle}>3. Polimento no Carro Todo</Text>
                <TouchableOpacity
                  style={[
                    styles.miniToggle,
                    hasGlobalPolishing && { backgroundColor: COLORS.gold }
                  ]}
                  onPress={() => setHasGlobalPolishing(!hasGlobalPolishing)}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: hasGlobalPolishing ? '#000' : COLORS.textGray
                    }}
                  >
                    {hasGlobalPolishing ? 'ATIVO' : 'DESATIVADO'}
                  </Text>
                </TouchableOpacity>
              </View>

              {hasGlobalPolishing && (
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.polOptionCard,
                      globalPolishingType === 'comercial' && styles.polOptionCardActive
                    ]}
                    onPress={() => setGlobalPolishingType('comercial')}
                  >
                    <Text style={styles.polOptionTitle}>Polimento Comercial (Rápido / Brilho)</Text>
                    <Text style={styles.polOptionPrice}>
                      R$ {workshopConfig.pricing.polishing.comercial.fullVehicle.toFixed(2)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.polOptionCard,
                      globalPolishingType === 'tecnico' && styles.polOptionCardActive
                    ]}
                    onPress={() => setGlobalPolishingType('tecnico')}
                  >
                    <Text style={styles.polOptionTitle}>Polimento Técnico (Corte, Refino, Lustro)</Text>
                    <Text style={styles.polOptionPrice}>
                      R$ {workshopConfig.pricing.polishing.tecnico.fullVehicle.toFixed(2)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.polOptionCard,
                      globalPolishingType === 'vitrificacao' && styles.polOptionCardActive
                    ]}
                    onPress={() => setGlobalPolishingType('vitrificacao')}
                  >
                    <Text style={styles.polOptionTitle}>Cristalização / Vitrificação Cerâmica</Text>
                    <Text style={styles.polOptionPrice}>
                      R$ {workshopConfig.pricing.polishing.vitrificacao.fullVehicle.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* BLOCO 4: ANEXO DE MÚLTIPLAS FOTOS DO VEÍCULO / AVARIAS */}
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>4. Fotos das Avarias & Veículo</Text>
              <Text style={styles.sectionDesc}>
                Selecione várias fotos de uma só vez da galeria do celular.
              </Text>

              <TouchableOpacity style={styles.photoPickerBtn} onPress={pickMultiplePhotos}>
                <Text style={styles.photoPickerBtnText}>📷 Selecionar Fotos da Galeria</Text>
              </TouchableOpacity>

              {newPhotos.length > 0 && (
                <View style={styles.photosGrid}>
                  {newPhotos.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumbWrap}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      <TouchableOpacity
                        style={styles.photoRemoveBtn}
                        onPress={() => removePhoto(idx)}
                      >
                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* BLOCO 5: FINALIZAR ORÇAMENTO */}
            <View style={styles.summaryCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: COLORS.textGray, fontSize: 13 }}>Margem de Lucro (%):</Text>
                <TextInput
                  style={styles.marginInput}
                  keyboardType="numeric"
                  value={newProfitMargin}
                  onChangeText={setNewProfitMargin}
                />
              </View>

              <TouchableOpacity style={styles.goldButton} onPress={handleSaveBudget}>
                <Text style={styles.goldButtonText}>Gravar Orçamento & Gerar Proposta</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* ABA 3: FLUXO DE CAIXA DA OFICINA */}
        {/* ========================================================= */}
        {activeTab === 'caixa' && (
          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Fluxo de Caixa da Oficina</Text>
              <TouchableOpacity
                style={styles.miniGoldBtn}
                onPress={() => setIsCashFlowModalOpen(true)}
              >
                <Text style={styles.miniGoldBtnText}>+ Lançar</Text>
              </TouchableOpacity>
            </View>

            {/* CARDS DE SALDO E ENTRADAS/SAÍDAS */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
              <View style={[styles.kpiCard, { flex: 1 }]}>
                <Text style={styles.kpiLabel}>Entradas</Text>
                <Text style={[styles.kpiValue, { color: COLORS.green }]}>
                  R${' '}
                  {cashFlow
                    .filter((c) => c.type === 'entrada')
                    .reduce((acc, c) => acc + c.amount, 0)
                    .toFixed(2)}
                </Text>
              </View>

              <View style={[styles.kpiCard, { flex: 1 }]}>
                <Text style={styles.kpiLabel}>Saídas</Text>
                <Text style={[styles.kpiValue, { color: COLORS.red }]}>
                  R${' '}
                  {cashFlow
                    .filter((c) => c.type === 'saida')
                    .reduce((acc, c) => acc + c.amount, 0)
                    .toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={[styles.kpiCard, { marginBottom: 20 }]}>
              <Text style={styles.kpiLabel}>Saldo em Caixa Atual</Text>
              <Text style={[styles.kpiValue, { color: COLORS.goldLight, fontSize: 24 }]}>
                R${' '}
                {(
                  cashFlow
                    .filter((c) => c.type === 'entrada')
                    .reduce((acc, c) => acc + c.amount, 0) -
                  cashFlow
                    .filter((c) => c.type === 'saida')
                    .reduce((acc, c) => acc + c.amount, 0)
                ).toFixed(2)}
              </Text>
            </View>

            <Text style={[styles.label, { color: COLORS.gold, marginBottom: 10 }]}>
              Extrato de Movimentações:
            </Text>

            {cashFlow.map((entry) => (
              <View key={entry.id} style={styles.cashFlowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>
                    {entry.description}
                  </Text>
                  <Text style={{ color: COLORS.textGray, fontSize: 11 }}>
                    {entry.date} • {entry.category}
                  </Text>
                </View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: entry.type === 'entrada' ? COLORS.green : COLORS.red
                  }}
                >
                  {entry.type === 'entrada' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* ABA 4: CONFIGURAÇÕES DA OFICINA (WHITE-LABEL) */}
        {/* ========================================================= */}
        {activeTab === 'config' && (
          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.sectionTitle}>Configurações da Oficina (White-Label)</Text>

            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>Dados do Estabelecimento</Text>

              <Text style={styles.label}>Nome da Oficina</Text>
              <TextInput
                style={styles.input}
                value={workshopConfig.workshopName}
                onChangeText={(v) => setWorkshopConfig({ ...workshopConfig, workshopName: v })}
              />

              <Text style={styles.label}>Endereço Completo</Text>
              <TextInput
                style={styles.input}
                value={workshopConfig.address}
                onChangeText={(v) => setWorkshopConfig({ ...workshopConfig, address: v })}
              />

              <Text style={styles.label}>WhatsApp da Oficina</Text>
              <TextInput
                style={styles.input}
                value={workshopConfig.phone}
                onChangeText={(v) => setWorkshopConfig({ ...workshopConfig, phone: v })}
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>Chave Pix para Recebimento de Sinal</Text>

              <Text style={styles.label}>Tipo de Chave Pix (CNPJ, Celular, etc.)</Text>
              <TextInput
                style={styles.input}
                value={workshopConfig.pixKeyType}
                onChangeText={(v) => setWorkshopConfig({ ...workshopConfig, pixKeyType: v })}
              />

              <Text style={styles.label}>Chave Pix Cadastrada</Text>
              <TextInput
                style={styles.input}
                value={workshopConfig.pixKey}
                onChangeText={(v) => setWorkshopConfig({ ...workshopConfig, pixKey: v })}
              />

              <Text style={styles.label}>Nome do Favorecido</Text>
              <TextInput
                style={styles.input}
                value={workshopConfig.pixBeneficiary}
                onChangeText={(v) => setWorkshopConfig({ ...workshopConfig, pixBeneficiary: v })}
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>Licença do Aplicativo</Text>
              <View style={styles.licenseBox}>
                <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>
                  ★ Licença Vitalícia Ativa
                </Text>
                <Text style={{ color: COLORS.textGray, fontSize: 12, marginTop: 4 }}>
                  Chave Vinculada: {licenseKey}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.goldButton, { marginBottom: 30 }]}
              onPress={() => Alert.alert('Salvo', 'Configurações da oficina atualizadas!')}
            >
              <Text style={styles.goldButtonText}>Salvar Configurações</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* ========================================================= */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      {/* ========================================================= */}
      <View style={styles.bottomNav}>
        {[
          { id: 'orcamentos', label: 'Orçamentos', icon: '📋' },
          { id: 'novo', label: 'Novo Orç.', icon: '➕' },
          { id: 'caixa', label: 'Caixa', icon: '💰' },
          { id: 'config', label: 'Oficina', icon: '⚙️' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navItem, activeTab === tab.id && styles.navItemActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={{ fontSize: 18 }}>{tab.icon}</Text>
            <Text
              style={[
                styles.navItemText,
                activeTab === tab.id && { color: COLORS.gold, fontWeight: 'bold' }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ========================================================= */}
      {/* MODAL: DETALHES DO ORÇAMENTO E RELATÓRIO */}
      {/* ========================================================= */}
      {selectedBudgetModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedBudgetModal.code}</Text>
                  <TouchableOpacity onPress={() => setSelectedBudgetModal(null)}>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalClientName}>{selectedBudgetModal.clientName}</Text>
                <Text style={styles.modalVehicle}>
                  {selectedBudgetModal.vehicleModel} • Placa: {selectedBudgetModal.vehiclePlate}
                </Text>

                <View style={styles.divider} />

                <Text style={[styles.label, { color: COLORS.gold }]}>Peças & Serviços:</Text>
                {selectedBudgetModal.parts.map((p) => (
                  <View key={p.id} style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{p.name}</Text>
                    <Text style={{ color: COLORS.textGray, fontSize: 11 }}>
                      Avaria: {p.severity} | Subtotal: R$ {p.subtotal.toFixed(2)}
                    </Text>
                  </View>
                ))}

                {selectedBudgetModal.globalPolishing && (
                  <View style={{ marginVertical: 6 }}>
                    <Text style={{ color: COLORS.goldLight, fontWeight: 'bold' }}>
                      Polimento Geral: {selectedBudgetModal.globalPolishing.type.toUpperCase()}
                    </Text>
                    <Text style={{ color: COLORS.textGray, fontSize: 11 }}>
                      Valor: R$ {selectedBudgetModal.globalPolishing.cost.toFixed(2)}
                    </Text>
                  </View>
                )}

                {/* FOTOS */}
                {selectedBudgetModal.photos && selectedBudgetModal.photos.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.label, { color: COLORS.gold }]}>Fotos Registradas:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedBudgetModal.photos.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.modalPhoto} />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* SINAL DE 50% & PIX */}
                <View style={styles.depositBox}>
                  <Text style={styles.depositTitle}>Sinal de 50% para Início dos Serviços:</Text>
                  <Text style={styles.depositAmount}>
                    R$ {selectedBudgetModal.downPayment50.toFixed(2)}
                  </Text>
                  <Text style={styles.pixInfo}>
                    Chave Pix: {workshopConfig.pixKey} ({workshopConfig.pixBeneficiary})
                  </Text>
                </View>

                {/* AÇÕES */}
                <TouchableOpacity
                  style={[styles.goldButton, { marginTop: 15 }]}
                  onPress={() => sendWhatsAppBudget(selectedBudgetModal)}
                >
                  <Text style={styles.goldButtonText}>Enviar Orçamento via WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.goldButton, { backgroundColor: '#059669', marginTop: 10 }]}
                  onPress={() => handleRegisterBudgetDeposit(selectedBudgetModal)}
                >
                  <Text style={[styles.goldButtonText, { color: '#FFF' }]}>
                    + Lançar Sinal (50%) no Caixa
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVO LANÇAMENTO NO FLUXO DE CAIXA */}
      {/* ========================================================= */}
      {isCashFlowModalOpen && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Novo Lançamento no Caixa</Text>
                <TouchableOpacity onPress={() => setIsCashFlowModalOpen(false)}>
                  <Text style={{ color: '#FFF', fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
                <TouchableOpacity
                  style={[styles.typeBtn, cfType === 'entrada' && { backgroundColor: COLORS.green }]}
                  onPress={() => setCfType('entrada')}
                >
                  <Text style={styles.typeBtnText}>Entrada (+)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, cfType === 'saida' && { backgroundColor: COLORS.red }]}
                  onPress={() => setCfType('saida')}
                >
                  <Text style={styles.typeBtnText}>Saída (-)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Pagamento Pintor / Compra Verniz"
                placeholderTextColor={COLORS.textMuted}
                value={cfDesc}
                onChangeText={setCfDesc}
              />

              <Text style={styles.label}>Valor (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={cfAmount}
                onChangeText={setCfAmount}
              />

              <TouchableOpacity
                style={[styles.goldButton, { marginTop: 15 }]}
                onPress={() => {
                  const val = parseFloat(cfAmount) || 0;
                  if (!cfDesc || val <= 0) {
                    Alert.alert('Atenção', 'Informe a descrição e o valor.');
                    return;
                  }
                  setCashFlow((prev) => [
                    {
                      id: `cf-${Date.now()}`,
                      type: cfType,
                      description: cfDesc,
                      category: cfCategory,
                      amount: val,
                      date: new Date().toLocaleDateString('pt-BR')
                    },
                    ...prev
                  ]);
                  setCfDesc('');
                  setCfAmount('');
                  setIsCashFlowModalOpen(false);
                }}
              >
                <Text style={styles.goldButtonText}>Confirmar Movimentação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// =========================================================================
// ESTILOS GERAIS AUTOGOLD (ALTO CONTRASTE E ACABAMENTO DOURADO NOBRE)
// =========================================================================
const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  authLogoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  authLogoText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.gold
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2
  },
  authSubtitle: {
    fontSize: 12,
    color: COLORS.goldSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 24,
    marginTop: 4
  },
  authCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  authFooter: {
    marginTop: 24,
    fontSize: 11,
    color: COLORS.textMuted
  },
  activateLink: {
    marginTop: 15,
    alignItems: 'center'
  },
  activateLinkText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: 'bold'
  },
  cardHeaderTitle: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  cardHeaderSub: {
    color: COLORS.textGray,
    fontSize: 12,
    marginBottom: 15
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  headerMiniLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1C180E',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerMiniLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gold
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF'
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.textGray,
    maxWidth: 160
  },
  licenseBadge: {
    backgroundColor: '#26200D',
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  licenseBadgeText: {
    color: COLORS.goldLight,
    fontSize: 10,
    fontWeight: 'bold'
  },
  contentScroll: {
    flex: 1,
    padding: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF'
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 14
  },
  miniGoldBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  miniGoldBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12
  },
  budgetCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  budgetCode: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gold,
    fontFamily: 'monospace'
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden'
  },
  budgetClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF'
  },
  budgetVehicle: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2
  },
  budgetCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#2A2A2A'
  },
  budgetLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  budgetSmallValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF'
  },
  budgetTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.goldLight
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  cardActionBtn: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  cardActionBtnText: {
    color: COLORS.textGray,
    fontSize: 12,
    fontWeight: 'bold'
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14
  },
  formCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12
  },
  label: {
    fontSize: 11,
    color: COLORS.textGray,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 13,
    marginBottom: 12
  },
  goldButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6
  },
  goldButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 6
  },
  chipText: {
    color: '#FFF',
    fontSize: 11
  },
  sevBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center'
  },
  sevBtnText: {
    fontSize: 10,
    color: COLORS.textGray
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  toggleBtnActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#2A2413'
  },
  toggleBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  miniLabel: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  miniInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 4,
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center'
  },
  polBtn: {
    flex: 1,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center'
  },
  polBtnText: {
    color: COLORS.textGray,
    fontSize: 10
  },
  addPartBtn: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6
  },
  addPartBtnText: {
    color: COLORS.goldLight,
    fontWeight: 'bold',
    fontSize: 12
  },
  addedPartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 8,
    borderRadius: 8,
    marginTop: 6
  },
  miniToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#2A2A2A'
  },
  polOptionCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  polOptionCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#26200D'
  },
  polOptionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600'
  },
  polOptionPrice: {
    color: COLORS.goldLight,
    fontWeight: 'bold',
    fontSize: 13
  },
  photoPickerBtn: {
    backgroundColor: '#181818',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  photoPickerBtnText: {
    color: COLORS.goldLight,
    fontWeight: 'bold',
    fontSize: 13
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  photoThumbWrap: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative'
  },
  photoThumb: {
    width: '100%',
    height: '100%'
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryCard: {
    backgroundColor: '#1C180E',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  marginInput: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    width: 50,
    color: COLORS.goldLight,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  kpiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4
  },
  cashFlowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#262626'
  },
  licenseBox: {
    backgroundColor: '#181408',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    padding: 12
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0D0D0D',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.gold
  },
  navItemText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.gold
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gold
  },
  modalClientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF'
  },
  modalVehicle: {
    fontSize: 13,
    color: COLORS.textGray
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 12
  },
  modalPhoto: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#444'
  },
  depositBox: {
    backgroundColor: '#241F10',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    padding: 12,
    marginTop: 15
  },
  depositTitle: {
    color: COLORS.goldLight,
    fontSize: 12,
    fontWeight: 'bold'
  },
  depositAmount: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2
  },
  pixInfo: {
    color: COLORS.textGray,
    fontSize: 11,
    marginTop: 4
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center'
  },
  typeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12
  }
});
