import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, StatusBar, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VERT   = '#2E7D32';
const ORANGE = '#D84315';
const BLANC  = '#FFFFFF';

const SECTIONS = [
  {
    titre: '🎓 Qui sommes-nous ?',
    contenu: `Fondé en 1992 par M. GOSSAN AKOUN, le GROUPE COFE-CESA est constitué de trois entités :\n\n• Cabinet COFE — Conseil, Organisation, Formation en Entreprise\n• CESA ABIDJAN — Formation des jeunes bacheliers\n• Hôtel Le Bonheur d'Alépé — Hôtellerie\n\nDepuis sa création, le groupe s'est engagé à offrir une excellence éducative au service des entreprises et des jeunes bacheliers.`,
  },
  {
    titre: '📖 Notre Histoire',
    contenu: `• 1992 — Création du Cabinet COFE\n• 2001 — Fondation de CESA ABIDJAN à Koumassi Nord-Est\n• 2006-2007 — Ouverture de l'antenne du Plateau (centre des affaires d'Abidjan)\n• 2008-2009 — Lancement du cycle Ingénieur\n• 2014-2015 — Lancement des Licences professionnelles\n• 2015 — Ouverture de l'antenne de Yopougon\n• 2022-2023 — Lancement des Masters professionnels`,
  },
  {
    titre: '🎯 Nos Domaines de Formation',
    contenu: `1. Formation Professionnelle Continue\nProgrammes avancés pour renforcer les compétences des cadres et agents de maîtrise des entreprises privées et publiques.\n\n2. Formation Qualifiante et Professionnelle\n• BTS (filières tertiaires et industrielles)\n• Licences professionnelles\n• Cycle Ingénieur\n• Masters professionnels\n\nAgréé par le Fonds de Développement de la Formation Professionnelle (F.D.F.P).`,
  },
  {
    titre: '💬 Mot du Fondateur',
    contenu: `"Le GROUPE COFE-CESA s'est donné pour mission d'offrir une excellence éducative au service des entreprises et des jeunes bacheliers. Avec passion et détermination, nous avons œuvré pour accompagner les entreprises dans l'optimisation de leurs performances.\n\nAnimé par la volonté de contribuer activement à l'avenir des jeunes, nous nous engageons à fournir les compétences et le professionnalisme requis pour exceller dans un marché de plus en plus exigeant."\n\n— M. GOSSAN AKOUN, Président Fondateur`,
  },
  {
    titre: '📍 Nos Contacts',
    contenu: null, // rendu spécial
  },
];

const CONTACTS = [
  {
    entite: '🏢 Cabinet COFE & CESA ABIDJAN',
    adresse: 'Koumassi Nord-Est, Terminus Bus 05\nderrière le Centre Communautaire',
    tels: ['(+225) 27 21 56 31 74', '(+225) 07 07 67 84 97'],
  },
  {
    entite: '🏨 Hôtel Le Bonheur d\'Alépé',
    adresse: 'Quartier Château, carrefour SODEFOR',
    tels: ['(+225) 27 24 34 38 58', '(+225) 07 02 88 80 80'],
  },
  {
    entite: '💻 Cours en ligne',
    adresse: null,
    tels: ['(+225) 05 44 13 61 13', '(+225) 07 19 01 47 97'],
  },
];

export default function AProposScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (i) => setOpenSection(openSection === i ? null : i);

  const appeler = (tel) => {
    const num = tel.replace(/\s/g, '').replace('(+225)', '+225');
    Linking.openURL(`tel:${num}`);
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={VERT} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.logoBadge}>
            <Text style={styles.logoTxt}>COFE</Text>
            <Text style={styles.logoSub}>CESA</Text>
          </View>
          <Text style={styles.heroTitre}>GROUPE COFE-CESA</Text>
          <Text style={styles.heroSlogan}>« Une excellence à votre service ! »</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeTxt}>🏛️ Fondé en 1992</Text>
          </View>
        </View>

        {/* STATS RAPIDES */}
        <View style={styles.statsRow}>
          {[
            { val: '30+', lbl: 'Ans\nd\'expérience' },
            { val: '3',   lbl: 'Antennes\nà Abidjan' },
            { val: '3',   lbl: 'Entités\ndu groupe' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        {/* ACCORDÉON SECTIONS */}
        <View style={styles.container}>
          {SECTIONS.map((sec, i) => (
            <View key={i} style={styles.accordion}>
              <TouchableOpacity
                style={styles.accordionHead}
                onPress={() => toggleSection(i)}
                activeOpacity={0.8}
              >
                <Text style={styles.accordionTitre}>{sec.titre}</Text>
                <Text style={styles.accordionArrow}>
                  {openSection === i ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {openSection === i && (
                <View style={styles.accordionBody}>
                  {sec.contenu ? (
                    <Text style={styles.accordionTxt}>{sec.contenu}</Text>
                  ) : (
                    // SECTION CONTACTS
                    CONTACTS.map((c, j) => (
                      <View key={j} style={styles.contactCard}>
                        <Text style={styles.contactEntite}>{c.entite}</Text>
                        {c.adresse && (
                          <Text style={styles.contactAdresse}>📍 {c.adresse}</Text>
                        )}
                        {c.tels.map((tel, k) => (
                          <TouchableOpacity
                            key={k}
                            style={styles.telBtn}
                            onPress={() => appeler(tel)}
                          >
                            <Text style={styles.telIcon}>📞</Text>
                            <Text style={styles.telTxt}>{tel}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* BOUTON SITE WEB */}
        <TouchableOpacity
          style={styles.siteBtn}
          onPress={() => Linking.openURL('https://cesa-elearning.com/cesa/')}
        >
          <Text style={styles.siteBtnTxt}>🌐 Visiter notre site web</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTxt}>GROUPE COFE-CESA © {new Date().getFullYear()}</Text>
          <Text style={styles.footerSub}>cesa-elearning.com</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7F5' },

  // HERO
  hero: {
    backgroundColor: VERT,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 36,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
  },
  deco2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -30,
  },
  logoBadge: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: BLANC, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: ORANGE, marginBottom: 14,
    elevation: 6,
  },
  logoTxt: { color: VERT, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  logoSub: { color: ORANGE, fontSize: 14, fontWeight: '800' },
  heroTitre: { color: BLANC, fontSize: 20, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center' },
  heroSlogan: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontStyle: 'italic', marginTop: 6, textAlign: 'center' },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 20, marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeTxt: { color: BLANC, fontSize: 13, fontWeight: '700' },

  // STATS
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: BLANC, borderRadius: 16, padding: 14,
    alignItems: 'center', elevation: 3,
    borderTopWidth: 3, borderTopColor: VERT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
  },
  statVal: { fontSize: 26, fontWeight: '900', color: VERT },
  statLbl: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 4, textAlign: 'center' },

  // ACCORDÉON
  container: { marginHorizontal: 16, marginTop: 16 },
  accordion: {
    backgroundColor: BLANC, borderRadius: 16, marginBottom: 10,
    elevation: 2, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
  },
  accordionHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  accordionTitre: { fontSize: 15, fontWeight: '800', color: '#1E293B', flex: 1 },
  accordionArrow: { color: VERT, fontSize: 12, fontWeight: '800', marginLeft: 8 },
  accordionBody: {
    paddingHorizontal: 16, paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  accordionTxt: { fontSize: 14, color: '#334155', lineHeight: 22 },

  // CONTACTS
  contactCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    marginTop: 10, borderLeftWidth: 4, borderLeftColor: VERT,
  },
  contactEntite: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  contactAdresse: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 8 },
  telBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 6,
  },
  telIcon: { fontSize: 16, marginRight: 8 },
  telTxt: { fontSize: 14, color: VERT, fontWeight: '700' },

  // SITE BTN
  siteBtn: {
    backgroundColor: ORANGE, marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 6,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  siteBtnTxt: { color: BLANC, fontSize: 15, fontWeight: '800' },

  // FOOTER
  footer: { alignItems: 'center', padding: 24 },
  footerTxt: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  footerSub: { color: '#94A3B8', fontSize: 11, marginTop: 3, fontStyle: 'italic' },
});