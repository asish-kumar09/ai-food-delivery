import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaShoppingBag, FaTruck, FaUtensils, FaClock, FaStar, FaMapMarkerAlt, FaBars, FaTimes } from "react-icons/fa";
import "../css/home.css";

function Home() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
    };

    return (
        <div className="home-wrapper">
            {/* Navigation */}
            <nav className="home-nav">
                <div className="nav-brand">
                    <span className="logo-dot"></span>
                    <h1>QuickBite</h1>
                </div>
                <div className={`nav-menu ${menuOpen ? 'nav-menu-open' : ''}`}>
                    <a href="#home" onClick={() => scrollToSection('home')}>Home</a>
                    <a href="#about" onClick={() => scrollToSection('about')}>About</a>
                    <a href="#services" onClick={() => scrollToSection('services')}>Services</a>
                    <a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a>
                </div>
                <div className="nav-actions">
                    <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
                    <button className="nav-btn-primary" onClick={() => navigate("/signup")}>Sign Up</button>
                </div>
                <div className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-container">
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-title">
                            Order Your Favourite Food <span className="highlight">Anytime</span>
                        </h1>
                        <p className="hero-subtitle">
                            Hey! Our delicious food is waiting for you, we are always near to you with fresh items of food
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-explore" onClick={() => navigate("/signup")}>
                                Explore Food <FaArrowRight />
                            </button>
                            
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-image"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="food-circle">
                            <img
                                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop"
                                alt="Delicious Pizza"
                                className="main-food-image"
                            />
                        </div>

                        {/* Floating Cards */}
                        <motion.div
                            className="floating-card card-1"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <FaShoppingBag className="card-icon" />
                            <div>
                                <p className="card-title">10k+</p>
                                <p className="card-text">Orders</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="floating-card card-2"
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                        >
                            <FaUtensils className="card-icon" />
                            <div>
                                <p className="card-title">150+</p>
                                <p className="card-text">Restaurants</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="floating-card card-3"
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                        >
                            <FaTruck className="card-icon" />
                            <div>
                                <p className="card-title">Fast</p>
                                <p className="card-text">Delivery</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Background Decorations */}
                <div className="bg-blob blob-1"></div>
                <div className="bg-blob blob-2"></div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>About <span className="highlight">QuickBite</span></h2>
                        <p>We are passionate about delivering the best food experience to your doorstep</p>
                    </motion.div>

                    <div className="about-content">
                        <motion.div
                            className="about-text"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3>Our Story</h3>
                            <p>
                                Founded in 2024, QuickBite has revolutionized food delivery by connecting food lovers
                                with their favorite restaurants. We believe that great food should be accessible to
                                everyone, anytime, anywhere.
                            </p>
                            <p>
                                Our platform serves over 10,000+ satisfied customers daily, partnering with 150+
                                premium restaurants to ensure you get the best quality food delivered fast.
                            </p>
                            <div className="about-stats">
                                <div className="stat-item">
                                    <h4>10K+</h4>
                                    <p>Happy Customers</p>
                                </div>
                                <div className="stat-item">
                                    <h4>150+</h4>
                                    <p>Restaurant Partners</p>
                                </div>
                                <div className="stat-item">
                                    <h4>4.9⭐</h4>
                                    <p>Average Rating</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="about-image"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                                alt="About QuickBite"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Our <span className="highlight">Services</span></h2>
                        <p>Everything you need for the perfect food delivery experience</p>
                    </motion.div>

                    <div className="services-grid">
                        <motion.div
                            className="service-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="service-icon">
                                <FaClock />
                            </div>
                            <h3>Fast Delivery</h3>
                            <p>Get your food delivered in 30 minutes or less with our lightning-fast delivery network.</p>
                        </motion.div>

                        <motion.div
                            className="service-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="service-icon">
                                <FaUtensils />
                            </div>
                            <h3>Quality Food</h3>
                            <p>We partner only with top-rated restaurants to ensure you get the highest quality meals.</p>
                        </motion.div>

                        <motion.div
                            className="service-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="service-icon">
                                <FaMapMarkerAlt />
                            </div>
                            <h3>Real-time Tracking</h3>
                            <p>Track your order in real-time from kitchen to your doorstep with our live tracking system.</p>
                        </motion.div>

                        <motion.div
                            className="service-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="service-icon">
                                <FaStar />
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Our customer support team is available round the clock to help with any queries or issues.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Get In <span className="highlight">Touch</span></h2>
                        <p>Ready to start your food journey? Join thousands of satisfied customers today!</p>
                    </motion.div>

                    <motion.div
                        className="contact-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="contact-info">
                            <div className="contact-item">
                                <h4>Customer Support</h4>
                                <p>📞 +91 98765 43210</p>
                                <p>📧 support@quickbite.com</p>
                            </div>
                            <div className="contact-item">
                                <h4>Business Hours</h4>
                                <p>🕒 24/7 Delivery Available</p>
                                <p>🕒 Support: 9 AM - 11 PM</p>
                            </div>
                            <div className="contact-item">
                                <h4>Coverage Area</h4>
                                <p>📍 Available in 50+ Cities</p>
                                <p>📍 Expanding Daily</p>
                            </div>
                        </div>

                        <div className="cta-section">
                            <h3>Start Ordering Now!</h3>
                            <p>Join over 10,000+ customers who trust QuickBite for their food delivery needs</p>
                            <div className="cta-buttons">
                                <button className="btn-primary" onClick={() => navigate("/signup")}>
                                    Sign Up Now <FaArrowRight />
                                </button>
                                <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                                    Browse Menu
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="nav-brand">
                                <span className="logo-dot"></span>
                                <h1>QuickBite</h1>
                            </div>
                            <p>Delivering happiness to your doorstep since 2024</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-section">
                                <h4>Quick Links</h4>
                                <a href="#home" onClick={() => scrollToSection('home')}>Home</a>
                                <a href="#about" onClick={() => scrollToSection('about')}>About</a>
                                <a href="#services" onClick={() => scrollToSection('services')}>Services</a>
                                <a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a>
                            </div>
                            <div className="footer-section">
                                <h4>Account</h4>
                                <a onClick={() => navigate("/login")}>Login</a>
                                <a onClick={() => navigate("/signup")}>Sign Up</a>
                                <a onClick={() => navigate("/dashboard")}>Dashboard</a>
                                <a onClick={() => navigate("/profile")}>Profile</a>
                            </div>
                            <div className="footer-section">
                                <h4>Support</h4>
                                <a onClick={() => navigate("/orderHistory")}>Order History</a>
                                <a onClick={() => navigate("/cart")}>Cart</a>
                                <a href="mailto:support@quickbite.com">Help Center</a>
                                <a href="tel:+919876543210">Call Support</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 QuickBite. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;