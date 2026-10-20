// Skýrslur nemenda um skutlutilraunina (Þemadagar – Eðlisfræði, 20. október 2026).
// Nöfn nemenda eru ekki skráð hér því vefurinn er opinber; hver skýrsla er auðkennd með númeri sínu.
//
// Til að bæta við skýrslu: afritaðu eina færslu og fylltu út.
//   maelingar.timi / maelingar.vegalengd: { hefdbundin, hringlaga } með
//     gildi    – einstakar mælingar ef þær eru gefnar (annars [])
//     tala     – talan sem hópurinn notaði (meðaltal, besta kast eða eina mæling)
//     lysing   – hvað talan táknar, t.d. "meðaltal 6 kasta"
//   eining: "s", "skref" eða "hænuskref". Ef ekkert var mælt er gildið null.
//   Eigindleg niðurstaða (án mælinga) fer í "eigindlegt".
//   kaflar.<lykill>.mat: "gott" | "bæta" | "vantar"
//   kastad: "svalir" (kastað niður af svölum), "gólf" (kastað eftir gangi/sal) eða null ef óljóst
//   einnig: önnur númer sem sama skýrsla var skilað undir
//   merki / stutt: birtingarheiti ef skýrslan hefur ekkert númer (nr er þá bara lykill)
//   Ef önnur skutlugerðin var ekki mæld er hún null í maelingar.
//   ofullgerd: true ef skýrslan er nánast óútfyllt; hún birtist þá en er ekki talin með í niðurstöðum

window.SKUTLUR = {
  verkefni: "Flýgur hringlaga skutla betur en hefðbundin skutla?",
  dagsetning: "20. október 2026",

  kaflar: [
    { lykill: "tilgangur", heiti: "1. Tilgangur og rannsóknarspurning" },
    { lykill: "tilgata", heiti: "2. Tilgáta" },
    { lykill: "efni", heiti: "3. Efni og áhöld" },
    { lykill: "framkvaemd", heiti: "4. Framkvæmd" },
    { lykill: "nidurstodur", heiti: "5. Niðurstöður" },
    { lykill: "tulkun", heiti: "6. Túlkun" },
    { lykill: "umraedur", heiti: "7. Umræður" },
    { lykill: "setning", heiti: "Niðurstaða í einni setningu" }
  ],

  skyrslur: [
    {
      nr: "234",
      titill: "Skutlu-tilraunin",
      fjoldi: 7,
      betur: "Lengur í loftinu, stöðugri og fallegra flug",
      maelt: ["tími"],
      kost: "2 köst á hvora skutlu, lengri tíminn skráður",
      stadur: "Kastað af svölum",
      kastad: "svalir",
      einnig: ["12"],
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 5, lysing: "lengra kastið af tveimur, talið í sekúndum" },
          hringlaga: { gildi: [], tala: 20, lysing: "lengra kastið af tveimur, talið í sekúndum" }
        },
        vegalengd: null
      },
      eigindlegt: { vegalengd: "Fullyrt að hringlaga hafi farið lengra, en ekkert mælt" },
      spa: { timi: "hringlaga", vegalengd: null },
      sigurvegari: { timi: "hringlaga", vegalengd: null },
      tilgataStodst: { segja: "já", gogn: "já" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla? „Hringlaga skutlan flýr lengra vegna stærra flatarmál vængsins og minni núningsviðnám í hlutfalli við lyftikraft. Hún var lengur í loftinu og fór lengra í vegalengd.“", athugasemd: "Niðurstöður eru komnar inn í tilgangskaflann. „Betur“ er ekki skilgreint hér." },
        tilgata: { mat: "gott", texti: "Hringlótta skutlan verði lengur í loftinu, meira stöðug, eigi auðveldara með að fljúga og fljúgi á fallegri hátt en sú oddhvassa.", athugasemd: "Skýr spá, en „stöðug“ og „fallegri“ eru ekki mælanleg." },
        efni: { mat: "bæta", texti: "Blöð, iPad, límstifti.", athugasemd: "Ekki tekið fram hvernig tíminn var mældur (talið í sekúndum)." },
        framkvaemd: { mat: "gott", texti: "Gerðu 11 skutlur eftir kennslumyndbandi (7 oddhvassar, 4 kringlóttar), völdu eina af hvorri gerð af handahófi, köstuðu hvorri tvisvar af svölunum og töldu sekúndurnar. Lengri tíminn skráður.", athugasemd: "Handahófsval skutlu er gott. Aðeins tvö köst á hvora skutlu og tíminn talinn, ekki tekinn." },
        nidurstodur: { mat: "bæta", texti: "Hringlaga: 20 s á lofti. Oddhvöss: 5 s á lofti. 4 köst alls, 2 á hvora skutlu.", athugasemd: "Bara besta kastið skráð, ekki öll köst eða meðaltal." },
        tulkun: { mat: "bæta", texti: "Kringlótta skutlan var 20 sekúndur í loftinu á meðan hefðbundna skutlan var bara 5 sekúndur, „sem þýðir að kringlótta skutlan var 25% lengur í loftinu“. Hún hefur meiri flöt fyrir loftið að halda í.", athugasemd: "Reikningsvilla: 20 s er fjórfaldur tími 5 s (300% lengur), ekki 25%." },
        umraedur: { mat: "bæta", texti: "Tilgátan reyndist rétt. Áhugavert væri að kanna hvernig skutlurnar haga sér án súrefnis eða aðdráttarafls.", athugasemd: "Engin umræða um óvissu eða hvað hefði mátt gera betur." },
        setning: { mat: "gott", texti: "Hringlóttu skutlurnar flugu fallegra og lengur en oddhvössu, sem sýnir að hringlóttu skutlurnar fljúga betur." }
      },
      athugasemdir: [
        "Prósentureikningur rangur (25% í stað 300%).",
        "Fullyrt að hringlaga hafi farið lengra án þess að vegalengd væri mæld.",
        "20 s flugtími af svölum er mjög langur miðað við aðra hópa; hæðin skýrir það líklega að hluta."
      ]
    },

    {
      nr: "9843",
      titill: "Skutlutilraun",
      fjoldi: 6,
      betur: "Ekki skilgreint (skoðuðu bæði vegalengd og tíma á lofti)",
      maelt: ["tími"],
      kost: "4 köst alls, eftir nokkrar prufur",
      stadur: "Fyrst á gangi, síðan á stærra svæði",
      kastad: "gólf",
      einnig: ["18"],
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 3.21, lysing: "óljóst hvort það er eitt kast eða meðaltal" },
          hringlaga: { gildi: [], tala: 5.2, lysing: "óljóst hvort það er eitt kast eða meðaltal" }
        },
        vegalengd: null
      },
      eigindlegt: { vegalengd: "Hefðbundin fór lengra (metið með auga, ekki mælt)" },
      spa: { timi: null, vegalengd: "hefdbundin" },
      sigurvegari: { timi: "hringlaga", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "já", gogn: "já" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint." },
        tilgata: { mat: "gott", texti: "Hefðbundin skutla fer lengra en hringlaga skutla. Erfiðast verður að kasta hringskutlunum.", athugasemd: "Skýr og prófanleg spá, en ekki rökstudd." },
        efni: { mat: "gott", texti: "Blað, límstifti, iPad til að skrá tímann, blýantur." },
        framkvaemd: { mat: "gott", texti: "Horfðu á myndbönd og bjuggu til skutlur. Í fyrstu tilraunum á gangi fóru hringskutlurnar alltaf í vegginn, svo þau fóru á stærra svæði og fundu út hvernig á að kasta þeim. Myndskreyttar leiðbeiningar um brot hringskutlu fylgja.", athugasemd: "Góð lýsing á því hvernig aðferðin var bætt. Fjöldi kasta á hvora skutlu kemur ekki fram." },
        nidurstodur: { mat: "bæta", texti: "Hver fer lengra? Hefðbundin. Hvor er lengur í loftinu? Hringskutla. Hefðbundin: 3,21 s. Hringskutla: 5,2 s. Fjöldi tilrauna: 4.", athugasemd: "Vegalengd ekki mæld. Óljóst hvort tímarnir eru eitt kast eða meðaltal." },
        tulkun: { mat: "gott", texti: "Hringlaga skutlan er lengur á lofti en fer til hliðar og upp og niður. Hefðbundna skutlan „sker loftið“ og fer beint og lengra, en er styttri í loftinu.", athugasemd: "Reyna að útskýra muninn út frá lögun." },
        umraedur: { mat: "gott", texti: "Tilgátan reyndist rétt. Hringskutlurnar fóru í sundur í byrjun; þau límdu endana saman og þá flugu þær betur. Áhugavert væri að mæla vegalengdina miklu nákvæmar.", athugasemd: "Gott að sjá eigin veikleika (vegalengd ekki mæld nákvæmlega)." },
        setning: { mat: "gott", texti: "Hefðbundin skutla fer lengra, en hringlaga skutlan er lengur í loftinu." }
      },
      athugasemdir: [
        "Eini hópurinn sem lýsir því hvernig skutlan er brotin, með myndum.",
        "Vegalengd metin með auga en ekki mæld."
      ]
    },

    {
      nr: "321",
      titill: "Skutluskýrslan",
      fjoldi: 6,
      betur: "Hraðar (en mældu tíma á lofti)",
      maelt: ["tími"],
      kost: "2 köst á hvora skutlu, tveir kastarar",
      stadur: "Ekki tilgreint (sami staður, svipaður kraftur)",
      kastad: null,
      einnig: ["13"],
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [1.26, 1.16], tala: 1.21, lysing: "meðaltal 2 kasta" },
          hringlaga: { gildi: [1.34, 1.51], tala: 1.425, lysing: "meðaltal 2 kasta" }
        },
        vegalengd: null
      },
      eigindlegt: {},
      spa: { timi: null, vegalengd: null },
      sigurvegari: { timi: "hringlaga", vegalengd: null },
      tilgataStodst: { segja: "ekki sagt", gogn: "nei" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Hvor skutlan fer hraðar? Vilja einnig skoða hvers vegna þær fljúga.", athugasemd: "Spurt um hraða en mældur var tími á lofti. Til að meta hraða þarf líka vegalengd." },
        tilgata: { mat: "gott", texti: "Hefðbundna skutlan fer hraðar því hún er mjórri og oddhvassari að framan og hefur minni loftmótstöðu. Hringlaga skutlan er breiðari og mætir meira lofti.", athugasemd: "Vel rökstudd með loftmótstöðu." },
        efni: { mat: "gott", texti: "A4 blöð, kennslumyndbönd á YouTube, skeiðklukka og hendurnar." },
        framkvaemd: { mat: "gott", texti: "Ein skutla af hvorri gerð úr eins pappír. Kastað á sama stað með svipuðum krafti, tíminn tekinn með skeiðklukku. Tveir kastarar, hvor kastaði einu sinni.", athugasemd: "Hugsað um að halda breytum föstum (sami pappír, staður, kraftur). Fá köst." },
        nidurstodur: { mat: "gott", texti: "Venjuleg: 1,26 s og 1,16 s, meðaltal 1,21 s. Hringlaga: 1,34 s og 1,51 s, meðaltal 1,425 s.", athugasemd: "Öll gildi og meðaltöl skráð. Hringlaga lengur á lofti í báðum köstum." },
        tulkun: { mat: "bæta", texti: "„En af hverju er munur?“ Túlkunin er sett fram í myndrænum spjöldum: lögun hefur áhrif á loftmótstöðu, lyftikraft, stöðugleika og hraða.", athugasemd: "Enginn eiginn texti; spjöldin virðast gervigreindarunnin. Ekki rætt hvort tilgátan um hraða stóðst." },
        umraedur: { mat: "bæta", texti: "„Tilgátan okkar var að hringlaga skutlan yrði lengur á lofti.“ Áhugavert væri að kanna fleiri gerðir af skutlum.", athugasemd: "Stangast á við tilgátukaflann (hefðbundin hraðari). Ekki sagt hvort tilgátan stóðst." },
        setning: { mat: "bæta", texti: "Það er greinilegur munur á skutlunum og opið á skutlunni hafði gríðarleg áhrif á flugtíma.", athugasemd: "Of sterkt orðað: munurinn er um 0,2 s eftir aðeins tvö köst á hvora." }
      },
      athugasemdir: [
        "Rannsóknarspurning (hraði), tilgáta og mæling (tími á lofti) passa ekki saman.",
        "Tilgáta sett fram á tvo ólíka vegu í skýrslunni.",
        "Túlkun að mestu í myndum sem virðast gerðar með gervigreind."
      ]
    },

    {
      nr: "444",
      titill: "Skutlu tilraun",
      fjoldi: 6,
      betur: "Lengri tími á flugi og lengri vegalengd",
      maelt: ["tími", "vegalengd"],
      kost: "6 köst með hefðbundinni, 7 með hringlaga",
      stadur: "Á gangi",
      kastad: "gólf",
      einnig: ["15"],
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [2.12, 1.88, 1.38, 1.48, 1.51, 1.26], tala: 1.605, lysing: "meðaltal 6 kasta" },
          hringlaga: { gildi: [2.09, 0.66, 1.06, 1.16, 1.13, 1.31, 2.03], tala: 1.35, lysing: "meðaltal 7 kasta" }
        },
        vegalengd: {
          eining: "skref",
          hefdbundin: { gildi: [12, 4, 10, 7, 8, 8.5], tala: 8.25, lysing: "meðaltal 6 kasta" },
          hringlaga: { gildi: [2, 2, 1, 2, 2.5, 1, 0.2], tala: 1.5, lysing: "meðaltal 7 kasta" }
        }
      },
      eigindlegt: {},
      spa: { timi: "hringlaga", vegalengd: "hringlaga" },
      sigurvegari: { timi: "hefdbundin", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "nei", gogn: "nei" },
      kaflar: {
        tilgangur: { mat: "gott", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla? Með tilliti til tíma á flugi og vegalengdar sem skutlan ferðaðist.", athugasemd: "Eini hópurinn sem skilgreinir „betur“ beint í rannsóknarspurningunni." },
        tilgata: { mat: "gott", texti: "Hringlaga skutlan flýgur betur þar sem hún hleypir meira lofti í gegnum sig; loftið streitist meira gegn venjulegu skutlunni.", athugasemd: "Rökstudd tilgáta." },
        efni: { mat: "gott", texti: "A4 blöð, límstifti, iPad." },
        framkvaemd: { mat: "gott", texti: "Tvær gerðir skutlna eftir myndbandi. Kastað á gangi, hefðbundinni 6 sinnum og hringlaga 7 sinnum. Tími á flugi tekinn og vegalengd mæld í skrefum. Meðaltal reiknað.", athugasemd: "Flest köst allra hópa og bæði tími og vegalengd mæld." },
        nidurstodur: { mat: "gott", texti: "Meðaltími: hringlaga 1,35 s, hefðbundin 1,605 s. Meðalvegalengd: hringlaga 1,5 skref, hefðbundin 8,25 skref. Hefðbundin var bæði lengur á flugi og flaug lengra.", athugasemd: "Öll gildi og útreikningar sýndir á handskrifuðu blaði. Útreikningar réttir (vegalengd hringlaga er 1,53 skref)." },
        tulkun: { mat: "bæta", texti: "„Hér má sjá helstu útreikninga tilraunarinnar“ ásamt mynd af útreikningum.", athugasemd: "Útreikningar sýndir en engin skýring á því hvers vegna hefðbundna skutlan flaug betur." },
        umraedur: { mat: "gott", texti: "Tilgátan reyndist röng. Kom á óvart hve miklu betri hefðbundna skutlan var. Voru ekki viss um hvernig best væri að kasta hringlaga skutlunni og myndu næst gefa sér meiri tíma í að finna það út.", athugasemd: "Heiðarlegt mat á eigin aðferð og raunhæf hugmynd að framhaldi." },
        setning: { mat: "gott", texti: "Venjuleg skutla flýgur betur en hringlaga skutla." }
      },
      athugasemdir: [
        "Ítarlegustu mæligögnin: öll köst skráð og meðaltöl reiknuð rétt.",
        "Eini hópurinn þar sem tilgátan stóðst ekki – og hópurinn segir það skýrt."
      ]
    },

    {
      nr: "832",
      titill: "Skutlutilraun",
      fjoldi: 5,
      betur: "Ekki skilgreint (vegalengd og tími á lofti)",
      maelt: ["tími", "vegalengd"],
      kost: "Kemur ekki fram",
      stadur: "Á gangi",
      kastad: "gólf",
      einnig: ["16"],
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 2.66, lysing: "„2 sekúndur og 66 sekúndubrot“" },
          hringlaga: { gildi: [], tala: 1.09, lysing: "„1 sekúnda og 9 sekúndubrot“" }
        },
        vegalengd: {
          eining: "hænuskref",
          hefdbundin: { gildi: [], tala: 35, lysing: "eitt gildi" },
          hringlaga: { gildi: [], tala: 6, lysing: "eitt gildi" }
        }
      },
      eigindlegt: {},
      spa: { timi: null, vegalengd: "hefdbundin" },
      sigurvegari: { timi: "hefdbundin", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "já", gogn: "að hluta" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint." },
        tilgata: { mat: "gott", texti: "Venjulega skutlan fer lengra því hún er oddhvöss og sker loftið. Hringskutlan safnar svo miklu lofti að hún fer hægar.", athugasemd: "Rökstudd tilgáta um vegalengd." },
        efni: { mat: "gott", texti: "Blöð og iPad (tímaklukka og myndavél)." },
        framkvaemd: { mat: "bæta", texti: "Bjuggu til skutlur eftir myndböndum á Classroom, köstuðu þeim eftir ganginum og mældu hversu langt þær fóru og hversu lengi þær voru í loftinu.", athugasemd: "Ekki tekið fram hversu oft var kastað eða hvernig vegalengd var mæld." },
        nidurstodur: { mat: "bæta", texti: "Vegalengd: venjuleg 35 hænuskref, hringlaga 6 hænuskref. Tími á lofti: venjuleg 2,66 s, hringlaga 1,09 s.", athugasemd: "Eitt gildi á hvora skutlu; óljóst hvort það er eitt kast eða meðaltal." },
        tulkun: { mat: "bæta", texti: "Lögun og kastkraftur hafa áhrif. Hringskutlan er breið með gat í miðjunni og fer því styttra „og er mun lengur í loftinu“. Venjulega skutlan sker loftið og kemst hraðar.", athugasemd: "Segir hringskutluna lengur á lofti, en þeirra eigin mæling sýnir hið gagnstæða (1,09 s á móti 2,66 s)." },
        umraedur: { mat: "bæta", texti: "Tilgátan var að venjulega skutlan færi lengra og hringskutlan væri lengur í loftinu; hún reyndist rétt. Áhugavert væri að kasta af þaki skólans.", athugasemd: "Bætir við spá um tíma sem var ekki í tilgátukaflanum. Gögnin styðja bara vegalengdarhlutann." },
        setning: { mat: "bæta", texti: "Venjulega skutlan fór lengra og hringskutlan var lengur í loftinu.", athugasemd: "Seinni hlutinn stangast á við mælingarnar." }
      },
      athugasemdir: [
        "Ályktun um tíma á lofti stangast á við eigin mælingar.",
        "Tilgátan í umræðukafla er víðari en í tilgátukafla."
      ]
    },

    {
      nr: "123",
      titill: "Skutlutilraun (án titils)",
      fjoldi: 6,
      betur: "Lengur í loftinu á leið niður af svölunum",
      maelt: ["tími"],
      kost: "3 köst á hvora skutlu, tekin upp á myndband",
      stadur: "Kastað af svölum",
      kastad: "svalir",
      einnig: ["11"],
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [3.18, 2.88, 2.59], tala: 2.9, lysing: "meðaltal 3 kasta (námundað fyrst)" },
          hringlaga: { gildi: [3.59, 4.46, 4.37], tala: 4.2, lysing: "meðaltal 3 kasta (námundað fyrst)" }
        },
        vegalengd: null
      },
      eigindlegt: {},
      spa: { timi: "hefdbundin", vegalengd: null },
      sigurvegari: { timi: "hringlaga", vegalengd: null },
      tilgataStodst: { segja: "nei", gogn: "nei" },
      kaflar: {
        tilgangur: { mat: "gott", texti: "Kanna hvort hringlaga pappírsskutla flýgur jafn lengi eða lengur en hefðbundin. Rannsóknarspurning: Hvor skutlan er lengur í loftinu að fara niður af svölunum?", athugasemd: "Hópurinn umorðaði spurninguna þannig að hún er mælanleg (tími á lofti) – gott." },
        tilgata: { mat: "bæta", texti: "„Skutlan hjá Fanney helst lengur í loftinu“ því oddurinn brýtur loftið og hún hefur vængi sem styðja við hana. Erfiðast verður að búa til skutlurnar.", athugasemd: "Rökstudd, en skutlan er nefnd eftir nemanda í stað gerðar (á við hefðbundnu skutluna)." },
        efni: { mat: "bæta", texti: "Aðeins blöð í skutlurnar og ekki fleiri gögn.", athugasemd: "Tíminn var tekinn og kastið tekið upp á myndband, en tæki til þess eru ekki talin upp." },
        framkvaemd: { mat: "gott", texti: "Vönduðu sig við skutlurnar. Köstuðu hvorri um það bil 3 sinnum af svölunum og tóku upp myndband. Námunduðu tímana að einum aukastaf, lögðu saman og deildu með þremur.", athugasemd: "Skýr lýsing, líka á útreikningi meðaltals. Talað um „hraðamun“ en mældur var tími." },
        nidurstodur: { mat: "gott", texti: "2 skutlur, 2 × 3 prófanir. Hefðbundin: 2,9 s. Hringlaga: 4,2 s (meðaltöl).", athugasemd: "Einstök köst sýnd á handskrifuðu blaði (3,18 · 2,88 · 2,59 og 3,59 · 4,46 · 4,37 s). Hringlaga lengur á lofti í öllum köstum." },
        tulkun: { mat: "gott", texti: "Fjalla um það sem gæti hafa skekkt niðurstöðurnar: afl kastsins, tímatakan (ýtt of seint eða snemma á takkann) og vindur eða blástur.", athugasemd: "Besta umfjöllun hópanna um óvissu og skekkjuvalda. Skýra hins vegar ekki hvers vegna hringlaga skutlan helst lengur á lofti." },
        umraedur: { mat: "gott", texti: "Tilgátan reyndist röng: hringlaga skutlan svífur betur. Munurinn var lítill í fyrstu tilraun en jókst í seinni köstum. „Það er betra að prófa fyrst áður en maður segir skoðun sína.“ Næst mætti mæla vegalengd og kasta oftar.", athugasemd: "Heiðarlegt og vel ígrundað, góðar hugmyndir að framhaldi." },
        setning: { mat: "bæta", texti: "Hringlaga skutlan flýgur lengur í lyftu heldur en hefðbundin skutla vegna hvernig þær eru í laginu.", athugasemd: "Niðurstaðan er rétt, en tilraunin sýnir ekki að lögunin sé orsökin („í lyftu“ á líklega að vera „í lofti“)." }
      },
      athugasemdir: [
        "Eini hópurinn sem ræðir skekkjuvalda markvisst.",
        "Hringlaga skutlan var lengur á lofti í öllum þremur köstunum.",
        "Tilgátan stóðst ekki og hópurinn segir það skýrt."
      ]
    },

    {
      nr: "10",
      titill: "Rannsókn á skutlum",
      fjoldi: 7,
      betur: "Ekki skilgreint (vegalengd, fallhraði og hve beint þær fljúga)",
      maelt: ["tími", "vegalengd"],
      kost: "Virðist eitt kast á hvora skutlu í hverri prófun",
      stadur: "Vegalengd í íþróttasal; tími á lofti af svölum",
      kastad: "svalir",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 4.03, lysing: "fall af svölum, eitt kast" },
          hringlaga: { gildi: [], tala: 2.68, lysing: "fall af svölum, eitt kast" }
        },
        vegalengd: {
          eining: "m",
          hefdbundin: { gildi: [], tala: 7.5, lysing: "í íþróttasal" },
          hringlaga: { gildi: [], tala: 1, lysing: "í íþróttasal" }
        }
      },
      eigindlegt: {},
      spa: { timi: "hringlaga", vegalengd: "hefdbundin" },
      sigurvegari: { timi: "hefdbundin", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "að hluta", gogn: "að hluta" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint, þó að hópurinn mæli þrennt." },
        tilgata: { mat: "bæta", texti: "Venjulega skutlan fer lengra og fer hraðar niður. Erfiðast verður að fá nákvæmar mælingar.", athugasemd: "Tvær skýrar og prófanlegar spár, en hvorug rökstudd." },
        efni: { mat: "gott", texti: "2 blöð og límstifti í skutlurnar; iPadar til að taka myndband og tímann." },
        framkvaemd: { mat: "gott", texti: "Mældu hversu langt skutlurnar fóru í íþróttasal (tveir kastarar), hversu hratt þær duttu niður af svölunum og loks hvor flaug beinna.", athugasemd: "Þrjár aðskildar prófanir. Ekki tekið fram hversu oft var kastað." },
        nidurstodur: { mat: "bæta", texti: "Vegalengd: venjuleg 7,5 m, hringlótt 1 m. Fall af svölum: venjuleg 4,03 s, hringlótt 2,68 s. Beinna flug: hringlótt. Erfitt var að kasta hringlóttu skutlunni.", athugasemd: "Eini hópurinn sem mælir í metrum. Virðist eitt kast á hvora skutlu. Í myndrænu samantektinni stendur að báðar fljúgi beint, en í töflunni að hringlótta fljúgi beinna." },
        tulkun: { mat: "bæta", texti: "Aðeins myndræn spjöld með samantekt á mælingum og ályktunum.", athugasemd: "Enginn eiginn texti; spjöldin virðast gervigreindarunnin." },
        umraedur: { mat: "gott", texti: "Tilgátan var að hluta rétt: venjulega skutlan fór lengra, en hringlótta skutlan fór „helmingi hraðar niður“. Venjulega skutlan er gerð til að haldast á lofti en hringlótta er með risagat í miðjunni. Áhugavert væri að kanna fall án loftmótstöðu, eins og í NASA-myndbandinu.", athugasemd: "Gerir skýran greinarmun á því hvaða hluti tilgátunnar stóðst. „Helmingi hraðar“ er ofmat: 4,03 / 2,68 ≈ 1,5." },
        setning: { mat: "gott", texti: "Venjuleg skutla fer lengra en hringlótta skutlan fer hraðar niður og beinna." }
      },
      athugasemdir: [
        "Af svölum var hefðbundna skutlan lengur á lofti – öfugt við 234 og 123, sem köstuðu líka af svölum.",
        "Eini hópurinn sem mælir vegalengd í metrum.",
        "Túlkun að mestu í myndum sem virðast gerðar með gervigreind."
      ]
    },

    {
      nr: "7",
      titill: "Skutlu-hringurinn",
      fjoldi: 7,
      ofullgerd: true,
      betur: "–",
      maelt: [],
      kost: "–",
      stadur: "–",
      kastad: null,
      maelingar: { timi: null, vegalengd: null },
      eigindlegt: {},
      spa: { timi: null, vegalengd: null },
      sigurvegari: { timi: null, vegalengd: null },
      tilgataStodst: { segja: "ekki sagt", gogn: "ekki sagt" },
      lysing: "Aðeins forsíða með titli, nöfnum og mynd af hringskutlu.",
      kaflar: {},
      athugasemdir: ["Skýrslan er bara forsíða; enginn kafli útfylltur."]
    },

    {
      nr: "6",
      titill: "Óútfyllt sniðmát",
      fjoldi: null,
      ofullgerd: true,
      betur: "–",
      maelt: [],
      kost: "–",
      stadur: "–",
      kastad: null,
      maelingar: { timi: null, vegalengd: null },
      eigindlegt: {},
      spa: { timi: null, vegalengd: null },
      sigurvegari: { timi: null, vegalengd: null },
      tilgataStodst: { segja: "ekki sagt", gogn: "ekki sagt" },
      lysing: "Óbreytt sniðmát: engin nöfn, engin dagsetning og enginn kafli útfylltur.",
      kaflar: {},
      athugasemdir: ["Óútfyllt sniðmát. Ekki ljóst hvaða hópur skilaði því – mögulega hópur sem skilaði annarri útgáfu undir öðru númeri."]
    },

    {
      nr: "an-nr",
      merki: "Skýrsla án númers",
      stutt: "án nr.",
      titill: "Skutlutilraun (án titils)",
      fjoldi: 6,
      betur: "Lengri vegalengd",
      maelt: ["tími", "vegalengd"],
      kost: "18 köst alls; aðeins besta kast hvorrar skutlu mælt",
      stadur: "Á gangi",
      kastad: "gólf",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 1.45, lysing: "besta kastið, tekið af myndbandi" },
          hringlaga: { gildi: [], tala: 0.75, lysing: "besta kastið, tekið af myndbandi" }
        },
        vegalengd: {
          eining: "m",
          hefdbundin: { gildi: [], tala: 9.61, lysing: "besta kastið, mælt með Measure-appi" },
          hringlaga: { gildi: [], tala: 1.61, lysing: "besta kastið, mælt með Measure-appi" }
        }
      },
      eigindlegt: {},
      spa: { timi: null, vegalengd: "hefdbundin" },
      sigurvegari: { timi: "hefdbundin", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "já", gogn: "já" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint í spurningunni (í reynd: vegalengd)." },
        tilgata: { mat: "gott", texti: "Fyrir flesta mun hefðbundin skutla fara mun lengra, en með réttri tækni gæti hringlaga skutlan komist lengra. Erfiðast verður að miða á svipaðan stað og kasta hringskutlunni rétt.", athugasemd: "Skýr spá, en seinni hlutinn („með réttri tækni“) er erfitt að prófa." },
        efni: { mat: "gott", texti: "A4 blöð og Measure-appið í spjaldtölvunni." },
        framkvaemd: { mat: "gott", texti: "Gerðu nokkrar skutlur og völdu bestu. Æfðu sig, tóku köstin upp á myndband til að mæla tíma og staðsetningu og mældu vegalengd frá upphafsstað með Measure-appi. Aðeins besta kastið var mælt.", athugasemd: "Góð og nútímaleg mæliaðferð (myndband og app). Aðeins besta kastið skráð af 18." },
        nidurstodur: { mat: "gott", texti: "Hringlaga: 1,61 m og 0,75 s. Hefðbundin: 9,61 m og 1,45 s. 18 köst alls.", athugasemd: "Skýr tafla í metrum og sekúndum. Myndir af mælingum á gangi fylgja." },
        tulkun: { mat: "gott", texti: "Hefðbundna skutlan fór 8 metrum lengra. Hraði hefðbundnu skutlunnar er 6,6 m/s en hringlaga 2,1 m/s.", athugasemd: "Eini hópurinn sem reiknar hraða rétt út frá vegalengd og tíma (9,61 / 1,45 ≈ 6,6). Engin skýring á muninum." },
        umraedur: { mat: "bæta", texti: "Tilgátan var að hefðbundna skutlan færi lengra og það reyndist rétt. Áhugavert væri að kasta af svölum og sjá hvor fer lengra þá.", athugasemd: "Stutt. Ekki rætt að aðeins besta kastið var notað." },
        setning: { mat: "bæta", texti: "Skutla sem er lengri og með mjórra nef kemst lengra.", athugasemd: "Alhæfing umfram tilraunina: bornar voru saman tvær gerðir, ekki lengd eða nef." }
      },
      athugasemdir: [
        "Skýrslan ber ekkert númer.",
        "Reiknar hraða (m/s) rétt út frá eigin mælingum.",
        "Hefðbundna skutlan var bæði lengur á lofti og fór sexfalt lengra."
      ]
    },

    {
      nr: "5",
      titill: "Skutlutilraun (án titils)",
      fjoldi: 6,
      betur: "Lengri vegalengd (og stöðugra flug)",
      maelt: ["vegalengd"],
      kost: "3 köst á hvora skutlu",
      stadur: "Kemur ekki fram",
      kastad: null,
      maelingar: {
        timi: null,
        vegalengd: {
          eining: "m",
          hefdbundin: { gildi: [4.82, 0.33, 8.61], tala: 4.59, lysing: "meðaltal 3 kasta" },
          hringlaga: { gildi: [0.34, 0.24, -0.24], tala: 0.11, lysing: "meðaltal 3 kasta" }
        }
      },
      eigindlegt: { timi: "Ekki mælt; fullyrt að hefðbundna skutlan hafi verið stöðugri í loftinu" },
      spa: { timi: null, vegalengd: "hefdbundin" },
      sigurvegari: { timi: null, vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "ekki sagt", gogn: "já" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint." },
        tilgata: { mat: "gott", texti: "Hefðbundna skutlan flýgur betur því oddurinn er beinn; hringlaga skutlunni verður erfiðara að kasta og hún er öðruvísi í laginu. Erfiðast verður að mæla rétt og nákvæmlega.", athugasemd: "Rökstudd spá." },
        efni: { mat: "bæta", texti: "Pappír, skæri og lím.", athugasemd: "Ekkert mælitæki talið upp, þó að vegalengd væri mæld í cm og m." },
        framkvaemd: { mat: "bæta", texti: "Bjuggu til báðar skutlurnar, æfðu sig að kasta og köstuðu þeim svo og mældu hvor flygi betur / færi lengra.", athugasemd: "Mjög stutt; vantar hvar var kastað og hvernig var mælt." },
        nidurstodur: { mat: "gott", texti: "Hringlaga: 34 cm, 24 cm, −24 cm. Hefðbundin: 4,82 m, 33 cm, 8,61 m.", athugasemd: "Öll köst skráð. Neikvæð vegalengd (−24 cm) bendir til að skutlan hafi farið aftur á bak – áhugavert að ræða. Mikil dreifing hjá hefðbundnu skutlunni." },
        tulkun: { mat: "bæta", texti: "Meðaltal hringlaga skutlunnar var 11 cm en venjulegu skutlunnar 4,59 m. Hefðbundna skutlan fór lengra, virkaði betur, flaug betur og var stöðugri í loftinu.", athugasemd: "Meðaltölin eru rétt reiknuð. „Stöðugri“ var ekki mælt og engin skýring gefin á muninum." },
        umraedur: { mat: "bæta", texti: "Tilgátan var að venjulega skutlan flygi betur; samvinnan gekk vel. Áhugavert væri að kanna hvernig best er að kasta hringlóttu skutlunni.", athugasemd: "Ekki sagt hvort tilgátan stóðst." },
        setning: { mat: "gott", texti: "Hefðbundna skutlan með beitta oddinn flaug betur en hringlótta skutlan." }
      },
      athugasemdir: [
        "Neikvætt gildi (−24 cm) í mælingum – gott tækifæri til að ræða hvað það þýðir.",
        "Meðaltöl reiknuð rétt, en dreifingin er mikil (0,33 m til 8,61 m).",
        "Ekki sagt hvort tilgátan stóðst, þó að gögnin styðji hana."
      ]
    },

    {
      nr: "3",
      titill: "Skutlutilraun (án titils)",
      fjoldi: null,
      betur: "Lengra og hraðar",
      maelt: ["vegalengd", "tími yfir 4 m"],
      kost: "Um 15 köst á hvora skutlu; lengsta kast skráð",
      stadur: "Á gangi (bein lína) og niður af annarri hæð",
      kastad: "gólf",
      maelingar: {
        timi: null,
        vegalengd: {
          eining: "m",
          hefdbundin: { gildi: [], tala: 5.66, lysing: "lengsta kast í beinni línu (niður af 2. hæð: 16,33 m)" },
          hringlaga: { gildi: [], tala: 5.29, lysing: "lengsta kast í beinni línu (niður af 2. hæð: 15,87 m)" }
        }
      },
      eigindlegt: { timi: "Mældu tíma yfir 4 m, ekki tíma á lofti: hefðbundin 1,06 s, hringlaga 1,71 s" },
      spa: { timi: null, vegalengd: "hringlaga" },
      sigurvegari: { timi: null, vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "nei", gogn: "nei" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint (í reynd: lengd og hraði)." },
        tilgata: { mat: "gott", texti: "Hringskutlan flýgur betur því loftmótstaðan er minni: gatið hleypir loftinu í gegn svo minna loft þarf að brjóta.", athugasemd: "Vel rökstudd með loftmótstöðu." },
        efni: { mat: "bæta", texti: "Blað og límstifti.", athugasemd: "Mælitæki (málband, skeiðklukka) vantar." },
        framkvaemd: { mat: "gott", texti: "Lærðu að gera skutlurnar á YouTube. Köstuðu hvorri um 15 sinnum, bæði í beinni línu á ganginum og niður á við. Mældu líka tíma yfir 4 metra færi.", athugasemd: "Margar prófanir og tvær kastaðferðir; aðeins lengsta kastið skráð." },
        nidurstodur: { mat: "gott", texti: "Venjuleg: 5,66 m í beinni línu, 16,33 m niður á við, 1,06 s yfir 4 m, lengd 29,5 cm. Hringlótt: 5,29 m í beinni línu, 15,87 m niður á við, 1,71 s yfir 4 m, þvermál 9 cm.", athugasemd: "Skýrar töflur fyrir hvora skutlu og mál skutlnanna sjálfra. „Hraði“ er í raun tími yfir 4 m (hraðinn er ≈ 3,8 og 2,3 m/s)." },
        tulkun: { mat: "gott", texti: "Venjuleg skutla er aðeins betri en hringlótt. Loftmótstaða, lögun skutlunnar og krafturinn í kastinu hafa áhrif á flugið.", athugasemd: "Varfærin og rétt ályktun („aðeins betri“). Textareitur með túlkuninni lendir á hverri síðu skýrslunnar (uppsetningarvilla)." },
        umraedur: { mat: "gott", texti: "Tilgátan var ekki rétt: venjulega skutlan komst lengra. Til að hringlótta skutlan ynni þyrfti líklega að kasta báðum niður af hæð. Áhugavert væri að mæla km/klst, stækka skutlurnar og bera saman þyngd.", athugasemd: "Margar góðar hugmyndir að framhaldi." },
        setning: { mat: "gott", texti: "Venjulega skutlan fór lengra og hraðar, bæði beint áfram og niður frá hæð tvö." }
      },
      athugasemdir: [
        "Engin nöfn eða dagsetning á forsíðu.",
        "Munurinn á skutlunum var lítill (5,66 m á móti 5,29 m) – hópurinn ályktar varfærnislega.",
        "Túlkunartexti endurtekinn ofan á hverri síðu (uppsetningarvilla)."
      ]
    },

    {
      nr: "2",
      titill: "Skutlutilraun (án titils)",
      fjoldi: 6,
      betur: "Breytt: hvort hefðbundin skutla kemst lengra en 10 m",
      maelt: ["tími", "vegalengd"],
      kost: "2 köst, aðeins hefðbundnar skutlur",
      stadur: "Niðri (kemur ekki nánar fram)",
      kastad: null,
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [4, 3], tala: 3.5, lysing: "meðaltal 2 skutlna" },
          hringlaga: null
        },
        vegalengd: {
          eining: "m",
          hefdbundin: { gildi: [13, 10], tala: 11.5, lysing: "meðaltal 2 skutlna" },
          hringlaga: null
        }
      },
      eigindlegt: {},
      spa: { timi: null, vegalengd: null },
      sigurvegari: { timi: null, vegalengd: null },
      tilgataStodst: { segja: "að hluta", gogn: "að hluta" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Hópurinn hætti við samanburðinn þegar hringskutlan slitnaði, en uppfærði ekki rannsóknarspurninguna." },
        tilgata: { mat: "bæta", texti: "Kringlótta skutlan slitnaði, svo aðeins hefðbundnar skutlur voru notaðar. Skutlan getur farið lengra en 10 metra, og flogið 10 metra á tveimur sekúndum ef henni er kastað eins fast og hægt er.", athugasemd: "Ný og prófanleg tilgáta, en hún svarar ekki rannsóknarspurningunni." },
        efni: { mat: "gott", texti: "Blað, iPad, reglustika, reiknivél, blýantur." },
        framkvaemd: { mat: "bæta", texti: "Gerðu tvær venjulegar skutlur og eina kringlótta. Fóru niður og köstuðu eins langt og fast og hægt var: 13 m á 4 s og 10 m á 3 s. Kringlótta skutlan datt í sundur.", athugasemd: "Niðurstöður eru skráðar hér í stað 5. kafla. Aðeins eitt kast á hvora skutlu." },
        nidurstodur: { mat: "bæta", texti: "Lengd skutlu 30 cm, vegalengd 11,5 m, tími 3,5 s, vængbreidd 12 cm.", athugasemd: "Aðeins meðaltöl í töflu; engin hringlaga skutla til samanburðar." },
        tulkun: { mat: "bæta", texti: "Fyrri skutlan fór 13 m á 4 s (3,25 m/s), hin 10 m á 3 s (3,33 m/s). Skutlan kemst lengra en 10 m en ekki 10 m á tveimur sekúndum. „Meðalhraðinn var 3,5.“ Tvær tilgátur réttar og ein röng.", athugasemd: "Hraðinn reiknaður rétt fyrir hvort kast, en 3,5 er meðaltími (s), ekki meðalhraði (≈ 3,3 m/s). Röð kastanna víxlast í textanum." },
        umraedur: { mat: "bæta", texti: "Tilgátan var röng því skutlan datt í sundur. Venjulega skutlan fór lengra en sú kringlótta. Ef hringskutlan hefði verið fest betur og kastað á sérstakan hátt hefði hún kannski farið lengra.", athugasemd: "Ekki hægt að álykta að hefðbundin fari lengra þegar hringskutlan var aldrei mæld. Góð umhugsun um hvað hefði mátt gera betur." },
        setning: { mat: "bæta", texti: "Hringlaga skutla fór ekki lengra en venjuleg skutla vegna þess að það þarf að kasta henni á sérstakan hátt.", athugasemd: "Stenst ekki: hringskutlan var aldrei mæld." }
      },
      athugasemdir: [
        "Hringskutlan slitnaði, svo enginn samanburður var gerður. Gott dæmi um að endurtaka hefði þurft smíðina frekar en að breyta rannsókninni.",
        "Rugla saman meðaltíma og meðalhraða.",
        "Ályktun um hringskutluna án nokkurra mælinga á henni."
      ]
    }
  ]
};
