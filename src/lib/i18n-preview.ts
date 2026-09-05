/* Console preview strings for every language (merged into the main dictionaries). */

type P = Record<string, string>;

const build = (
  status: string, active: string, console_: string, initialize: string,
  fetching: string, rotating: string, connected: string, waiting: string,
): P => ({
  "preview.status": status,
  "preview.active": active,
  "preview.console": console_,
  "preview.stable": "NODE_STABLE",
  "preview.initialize": initialize,
  "preview.fetching": fetching,
  "preview.rotating": rotating,
  "preview.connected": connected,
  "preview.waiting": waiting,
});

export const PREVIEW: Record<string, P> = {
  fr: build("Statut", "Actif", "Console", "initialiser --tunnel-securise", "Récupération du manifeste de la boutique...", "Rotation des clés de paiement (AES-256)...", "Tunnel sécurisé établi via 0.0.0.0:8080", "En attente de saisie..."),
  de: build("Status", "Aktiv", "Konsole", "initialisieren --sicherer-tunnel", "Shop-Manifest wird geladen...", "Zahlungsschlüssel werden rotiert (AES-256)...", "Sicherer Tunnel über 0.0.0.0:8080 hergestellt", "Warte auf Eingabe..."),
  pt: build("Estado", "Ativo", "Consola", "inicializar --tunel-seguro", "A obter o manifesto da loja...", "A rodar chaves de pagamento (AES-256)...", "Túnel seguro estabelecido via 0.0.0.0:8080", "A aguardar entrada..."),
  it: build("Stato", "Attivo", "Console", "inizializza --tunnel-sicuro", "Recupero del manifest del negozio...", "Rotazione delle chiavi di pagamento (AES-256)...", "Tunnel sicuro stabilito via 0.0.0.0:8080", "In attesa di input..."),
  nl: build("Status", "Actief", "Console", "initialiseren --beveiligde-tunnel", "Winkelmanifest ophalen...", "Betaalsleutels roteren (AES-256)...", "Beveiligde tunnel opgezet via 0.0.0.0:8080", "Wachten op invoer..."),
  sv: build("Status", "Aktiv", "Konsol", "initiera --saker-tunnel", "Hämtar butiksmanifest...", "Roterar betalningsnycklar (AES-256)...", "Säker tunnel upprättad via 0.0.0.0:8080", "Väntar på inmatning..."),
  pl: build("Status", "Aktywny", "Konsola", "inicjalizuj --bezpieczny-tunel", "Pobieranie manifestu sklepu...", "Rotacja kluczy płatności (AES-256)...", "Bezpieczny tunel ustanowiony przez 0.0.0.0:8080", "Oczekiwanie na dane..."),
  ru: build("Статус", "Активно", "Консоль", "инициализация --защищённый-туннель", "Получение манифеста магазина...", "Ротация платёжных ключей (AES-256)...", "Защищённый туннель установлен через 0.0.0.0:8080", "Ожидание ввода..."),
  uk: build("Статус", "Активно", "Консоль", "ініціалізація --захищений-тунель", "Отримання маніфесту магазину...", "Ротація платіжних ключів (AES-256)...", "Захищений тунель встановлено через 0.0.0.0:8080", "Очікування вводу..."),
  tr: build("Durum", "Aktif", "Konsol", "baslat --guvenli-tunel", "Mağaza manifesti alınıyor...", "Ödeme anahtarları döndürülüyor (AES-256)...", "Güvenli tünel kuruldu: 0.0.0.0:8080", "Girdi bekleniyor..."),
  ar: build("الحالة", "نشط", "وحدة التحكم", "تهيئة --نفق-آمن", "جارٍ جلب بيانات المتجر...", "تدوير مفاتيح الدفع (AES-256)...", "تم إنشاء نفق آمن عبر 0.0.0.0:8080", "في انتظار الإدخال..."),
  hi: build("स्थिति", "सक्रिय", "कंसोल", "प्रारंभ --सुरक्षित-टनल", "स्टोर मैनिफ़ेस्ट प्राप्त किया जा रहा है...", "भुगतान कुंजियाँ बदली जा रही हैं (AES-256)...", "0.0.0.0:8080 के माध्यम से सुरक्षित टनल स्थापित", "इनपुट की प्रतीक्षा..."),
  id: build("Status", "Aktif", "Konsol", "inisialisasi --terowongan-aman", "Mengambil manifest toko...", "Merotasi kunci pembayaran (AES-256)...", "Terowongan aman dibuat via 0.0.0.0:8080", "Menunggu masukan..."),
  vi: build("Trạng thái", "Hoạt động", "Bảng điều khiển", "khoi-tao --duong-ham-bao-mat", "Đang tải cấu hình cửa hàng...", "Đang xoay khóa thanh toán (AES-256)...", "Đã thiết lập đường hầm bảo mật qua 0.0.0.0:8080", "Đang chờ nhập..."),
  th: build("สถานะ", "ใช้งานอยู่", "คอนโซล", "เริ่มต้น --อุโมงค์ปลอดภัย", "กำลังดึงข้อมูลร้านค้า...", "กำลังหมุนคีย์การชำระเงิน (AES-256)...", "สร้างอุโมงค์ปลอดภัยผ่าน 0.0.0.0:8080 แล้ว", "รอการป้อนข้อมูล..."),
  zh: build("状态", "运行中", "控制台", "初始化 --安全隧道", "正在获取店铺配置...", "正在轮换支付密钥 (AES-256)...", "已通过 0.0.0.0:8080 建立安全隧道", "等待输入..."),
  ja: build("ステータス", "稼働中", "コンソール", "初期化 --セキュアトンネル", "ストア設定を取得中...", "決済キーをローテーション中 (AES-256)...", "0.0.0.0:8080 経由でセキュアトンネルを確立", "入力待ち..."),
  ko: build("상태", "활성", "콘솔", "초기화 --보안-터널", "스토어 설정 불러오는 중...", "결제 키 교체 중 (AES-256)...", "0.0.0.0:8080 통해 보안 터널 연결됨", "입력 대기 중..."),
  ca: build("Estat", "Actiu", "Consola", "inicialitza --tunel-segur", "Obtenint la configuració de la botiga...", "Rotant claus de pagament (AES-256)...", "Túnel segur establert via 0.0.0.0:8080", "Esperant entrada..."),
  val: build("Estat", "Actiu", "Consola", "inicialitza --tunel-segur", "Obtenint la configuració de la botiga...", "Rotant claus de pagament (AES-256)...", "Túnel segur establit via 0.0.0.0:8080", "Esperant entrada..."),
  gl: build("Estado", "Activo", "Consola", "inicializar --tunel-seguro", "Obtendo a configuración da tenda...", "Rotando chaves de pago (AES-256)...", "Túnel seguro establecido a través de 0.0.0.0:8080", "Agardando entrada..."),
  eu: build("Egoera", "Aktibo", "Kontsola", "hasieratu --tunel-segurua", "Dendaren konfigurazioa eskuratzen...", "Ordainketa-gakoak biratzen (AES-256)...", "Tunel segurua ezarrita 0.0.0.0:8080 bidez", "Sarrera zain..."),
};
