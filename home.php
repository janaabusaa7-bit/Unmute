<?php
require_once __DIR__ . '/includes/i18n.php';

$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
$is_en = $lang_code === 'en';

$team = [
    [
        'img' => 'assets/jana.jpeg',
        'name_ar' => 'جنى رائد أبو صاع',
        'name_en' => 'Jana Raed Abu Saa',
        'role_ar' => 'عضو فريق',
        'role_en' => 'Team Member'
    ],
    [
        'img' => 'assets/masa.jpeg',
        'name_ar' => 'ماسة مجاهد برهم',
        'name_en' => 'Masa Mojahed Barham',
        'role_ar' => 'عضو فريق',
        'role_en' => 'Team Member'
    ],
    [
        'img' => 'assets/doaa.jpeg',
        'name_ar' => 'دعاء عمر شحرور',
        'name_en' => 'Doaa Omar Shahroor',
        'role_ar' => 'عضو فريق',
        'role_en' => 'Team Member'
    ],
    [
        'img' => 'assets/adham.jpeg',
        'name_ar' => 'أدهم سعد الله هبّاش',
        'name_en' => 'Adham Saad Allah Habbash',
        'role_ar' => 'عضو فريق',
        'role_en' => 'Team Member'
    ],
    [
        'img' => 'assets/dr.jpeg',
        'name_ar' => 'د. شرين حجازي',
        'name_en' => 'Dr. Shreen Hijazi',
        'role_ar' => 'مشرفة المشروع',
        'role_en' => 'Project Supervisor',
        'supervisor' => true
    ],
];
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unmute | Home</title>

    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/home.css?v=<?php echo time(); ?>">
</head>

<body>

<?php include 'includes/header-guest.php'; ?>

<main>

    <!-- ================= HERO ================= -->
    <section id="home" class="home-hero-section">
        <canvas id="heroCanvas"></canvas>

        <div class="hero-glow hero-glow-one"></div>
        <div class="hero-glow hero-glow-two"></div>

        <div class="home-container hero-layout">

            <div class="hero-text-box">
                <span class="hero-badge">
                    <i class="fa-solid fa-hands"></i>
                    <?php echo $is_en ? 'Unmute Platform' : 'منصة Unmute'; ?>
                </span>

                <h1>
                    <?php echo $is_en
                        ? 'Unmute: The Voice of the Deaf and Mute in a Digital World.'
                        : 'Unmute: صوت الصم والبكم في عالم رقمي.'; ?>
                </h1>

                <p>
                    <?php echo $is_en
                        ? 'We provide a supportive environment specially designed for the deaf and mute, combining sign language translation, learning, and interactive features in one easy-to-use platform.'
                        : 'نوفر بيئة داعمة ومصممة خصيصًا للصم والبكم، تجمع بين الترجمة بلغة الإشارة، التعلم، والميزات التفاعلية في منصة واحدة سهلة الاستخدام.'; ?>
                </p>

                <div class="hero-actions">
                    <a href="login.php" class="main-btn">
                        <?php echo $is_en ? 'Enter Platform' : 'الدخول إلى المنصة'; ?>
                        <i class="fa-solid fa-arrow-left"></i>
                    </a>

                    <a href="#about-us-section" class="ghost-btn">
                        <?php echo $is_en ? 'Learn More' : 'تعرف أكثر'; ?>
                    </a>
                </div>
            </div>

            <div class="hero-visual-box">
                <div class="hero-orbit orbit-one"></div>
                <div class="hero-orbit orbit-two"></div>

                <div class="hero-chip chip-one">
                    <i class="fa-solid fa-ear-listen"></i>
                </div>

                <div class="hero-chip chip-two">
                    <i class="fa-solid fa-hands"></i>
                </div>

                <div class="hero-chip chip-three">
                    <i class="fa-solid fa-comment-dots"></i>
                </div>

                <div class="hero-chip chip-four">
                    <i class="fa-solid fa-map-location-dot"></i>
                </div>

                <div class="hero-image-card">
                    <img src="assets/hero_deaf_3d.png" alt="Unmute platform illustration">
                </div>
            </div>

        </div>
    </section>

    <div class="wave-divider wave-white">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64 C180,120 360,20 540,70 C720,120 900,40 1080,70 C1260,100 1360,80 1440,40 L1440,120 L0,120 Z"></path>
        </svg>
    </div>


    <!-- ================= ABOUT ================= -->
    <section id="about-us-section" class="about-section">
        <div class="about-circle-bg"></div>

        <div class="home-container">

            <div class="section-heading reveal">
                <h2>
                    <?php echo $is_en
                        ? 'We are here to break isolation barriers.'
                        : 'من نحن: كسر حاجز العزلة'; ?>
                </h2>

                <div class="title-line"></div>

                <p>
                    <?php echo $is_en
                        ? 'At Unmute, we see technology as a real way to support and empower the deaf and mute community in their daily lives.'
                        : 'في Unmute، نرى التكنولوجيا كوسيلة حقيقية لدعم وتمكين مجتمع الصم والبكم في حياتهم اليومية.'; ?>
                </p>

                <p>
                    <?php echo $is_en
                        ? 'The platform was designed to be a supportive space for communication and learning, with tools that fit the needs of users and make digital interaction easier.'
                        : 'صُممت المنصة لتكون مساحة داعمة للتعبير والتعلم، بوجود أدوات متخصصة تناسب احتياجات المستخدمين وتجعل التفاعل الرقمي أسهل.'; ?>
                </p>

                <p class="mini-title">
                    <?php echo $is_en ? 'We help users achieve:' : 'نحن نساعد في تحقيق:'; ?>
                </p>
            </div>

            <div class="about-cards">

                <article class="about-card reveal">
                    <div class="about-icon">
                        <i class="fa-solid fa-hands-asl-interpreting"></i>
                    </div>
                    <h3><?php echo $is_en ? 'Sign communication' : 'التواصل بلغة الإشارة'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Communicate more easily through tools that support text, voice, and sign-based meaning.'
                            : 'تواصل بشكل أسهل ومباشر باستخدام أدوات تدعم ترجمة النصوص والصوت إلى لغة إشارة.'; ?>
                    </p>
                </article>

                <article class="about-card reveal">
                    <div class="about-icon">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <h3><?php echo $is_en ? 'Supportive community' : 'مجتمع داعم ومترابط'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'A safe social space that helps users share, interact, and build connections.'
                            : 'بيئة اجتماعية رقمية مخصصة للصم والبكم تساعد على كسر حواجز العزلة وبناء الصداقات.'; ?>
                    </p>
                </article>

                <article class="about-card reveal">
                    <div class="about-icon">
                        <i class="fa-solid fa-list-check"></i>
                    </div>
                    <h3><?php echo $is_en ? 'Tasks and smart access' : 'تنظيم المهام والوصول الذكي'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Organize daily routines and reach useful places through a clear visual interface.'
                            : 'تنظيم روتينك اليومي بفعالية مع واجهة بصرية مريحة، وخريطة للوصول السريع للأماكن المناسبة.'; ?>
                    </p>
                </article>

            </div>

        </div>
    </section>

    <div class="wave-divider wave-blue">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,50 C220,10 330,120 540,70 C750,20 890,115 1100,65 C1260,30 1360,50 1440,85 L1440,120 L0,120 Z"></path>
        </svg>
    </div>


    <!-- ================= PLATFORM SHOWCASE ================= -->
    <section id="platform-showcase" class="platform-section">
        <div class="home-container">

            <div class="section-heading platform-heading reveal">
                <span><?php echo $is_en ? 'Inside the platform' : 'داخل المنصة'; ?></span>
                <h2><?php echo $is_en ? 'What does Unmute include?' : 'ماذا تحتوي منصة Unmute؟'; ?></h2>
                <p>
                    <?php echo $is_en
                        ? 'Each part of the platform was designed to be clear, useful, and easy to reach.'
                        : 'كل جزء في المنصة صُمم ليكون واضحًا، مفيدًا، وسهل الوصول للمستخدم.'; ?>
                </p>
            </div>

            <div class="stack-showcase reveal">

                <article class="stack-card card-one">
                    <div class="stack-icon">
                        <i class="fa-solid fa-language"></i>
                    </div>
                    <small>01</small>
                    <h3><?php echo $is_en ? 'Translation' : 'الترجمة'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Convert words and phrases into clearer visual meaning.'
                            : 'تحويل الكلمات والجمل إلى معنى بصري أوضح.'; ?>
                    </p>
                </article>

                <article class="stack-card card-two">
                    <div class="stack-icon">
                        <i class="fa-solid fa-book-open-reader"></i>
                    </div>
                    <small>02</small>
                    <h3><?php echo $is_en ? 'Learning' : 'التعلّم'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Learn signs through simple lessons and practice.'
                            : 'تعلّم الإشارات من خلال دروس وتدريبات بسيطة.'; ?>
                    </p>
                </article>

                <article class="stack-card card-three">
                    <div class="stack-icon">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <small>03</small>
                    <h3><?php echo $is_en ? 'Community' : 'المجتمع'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Share posts, comments, and connect with others.'
                            : 'مشاركة المنشورات والتعليقات والتواصل مع الآخرين.'; ?>
                    </p>
                </article>

                <article class="stack-card card-four">
                    <div class="stack-icon">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <small>04</small>
                    <h3><?php echo $is_en ? 'Daily Tasks' : 'المهام اليومية'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Organize daily tasks in a visual and simple way.'
                            : 'تنظيم المهام اليومية بطريقة بصرية وبسيطة.'; ?>
                    </p>
                </article>

                <article class="stack-card card-five">
                    <div class="stack-icon">
                        <i class="fa-solid fa-map-location-dot"></i>
                    </div>
                    <small>05</small>
                    <h3><?php echo $is_en ? 'Places Map' : 'خريطة الأماكن'; ?></h3>
                    <p>
                        <?php echo $is_en
                            ? 'Find accessible and helpful places nearby.'
                            : 'معرفة الأماكن المناسبة والقريبة من المستخدم.'; ?>
                    </p>
                </article>

            </div>

        </div>
    </section>

    <div class="wave-divider wave-team">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,80 C180,35 340,95 520,50 C720,0 880,110 1080,55 C1250,10 1360,35 1440,70 L1440,120 L0,120 Z"></path>
        </svg>
    </div>


    <!-- ================= TEAM ================= -->
    <section class="team-presentation-section">
        <div class="home-container">

            <div class="team-presentation-title reveal">
                <div class="team-top-line"></div>

                <h2>
                    <?php echo $is_en ? 'Our Team Members' : 'أعضاء فريق المشروع'; ?>
                </h2>

                <p>
                    <?php echo $is_en
                        ? 'The team behind Unmute '
                        : 'الفريق الذي عمل على بناء منصة Unmute '; ?>
                </p>
            </div>

            <div class="team-presentation-row reveal">

                <?php foreach ($team as $index => $member): ?>
                    <article class="presentation-member-card <?php echo !empty($member['supervisor']) ? 'supervisor-member-card' : ''; ?>"
                             style="--delay: <?php echo $index * 0.12; ?>s">

                        <span class="diagonal-line diagonal-line-left"></span>
                        <span class="diagonal-line diagonal-line-right"></span>

                        <div class="presentation-photo">
                            <img src="<?php echo $member['img']; ?>"
                                 alt="<?php echo htmlspecialchars($is_en ? $member['name_en'] : $member['name_ar']); ?>"
                                 loading="lazy">
                        </div>

                        <div class="presentation-info">
                            <h3>
                                <?php echo $is_en ? $member['name_en'] : $member['name_ar']; ?>
                            </h3>

                            <p>
                                <?php echo $is_en ? $member['role_en'] : $member['role_ar']; ?>
                            </p>
                        </div>

                    </article>
                <?php endforeach; ?>

            </div>

        </div>
    </section>

</main>

<?php include 'includes/footer.php'; ?>

<script src="js/home.js?v=<?php echo time(); ?>"></script>

</body>
</html>