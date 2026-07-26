import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaMapMarker, 
  FaPhone, 
  FaEnvelope, 
  FaHome, 
  FaInfoCircle, 
  FaAddressBook,
  FaCoffee,
  FaHamburger,
  FaPizzaSlice,
  FaIceCream,
  FaAppleAlt,
  FaLeaf,
  FaTruck,
  FaClock,
  FaShoppingCart,
  FaBookOpen,
  FaCreditCard
} from "react-icons/fa";

const Footer: React.FC = () => {
  // Cafeteria Services
  const services = [
    { icon: <FaCoffee />, title: "Breakfast", link: "/menu#breakfast" },
    { icon: <FaHamburger />, title: "Lunch Specials", link: "/menu#lunch" },
    { icon: <FaPizzaSlice />, title: "Dinner", link: "/menu#dinner" },
    { icon: <FaIceCream />, title: "Desserts", link: "/menu#desserts" },
    { icon: <FaAppleAlt />, title: "Healthy Options", link: "/menu#healthy" },
    { icon: <FaTruck />, title: "Campus Delivery", link: "/delivery" },
  ];

  // Quick Links for Cafeteria
  const quickLinks = [
    { icon: <FaHome />, title: "Home", href: "/" },
    { icon: <FaInfoCircle />, title: "About Us", href: "/about" },
    { icon: <FaBookOpen />, title: "Food Menu", href: "/menu" },
    { icon: <FaAddressBook />, title: "Contact Us", href: "/contact" },
    { icon: <FaShoppingCart />, title: "Order Online", href: "/order" },
    { icon: <FaCreditCard />, title: "Meal Plans", href: "/meal-plans" },
  ];

  // Cafeteria Contact Info
  const contactInfo = [
    { 
      icon: <FaMapMarker />, 
      text: "Location", 
      detail: "MTU Tepi Campus, Student Lounge" 
    },
    { 
      icon: <FaPhone />, 
      text: "Phone", 
      detail: "0906974055" 
    },
    { 
      icon: <FaClock />, 
      text: "Hours", 
      detail: "Mon-Fri: 7AM - 8PM\nSat-Sun: 8AM - 6PM" 
    },
  ];

  // Social Media Links
  const socialLinks = [
    { icon: <FaFacebook />, href: "https://facebook.com/campuscafe", label: "Facebook" },
    { icon: <FaInstagram />, href: "https://instagram.com/campuscafe", label: "Instagram" },
    { icon: <FaTwitter />, href: "https://twitter.com/campuscafe", label: "Twitter" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 border-t-4 border-orange-500">
      <div className="container mx-auto px-4">
        {/* Main Footer Content - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: About Café */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-orange-500 mb-4">
              Campus Café
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Serving fresh, delicious meals to the campus community since 2010. 
              We're committed to providing quality food with fast, friendly service 
              in a welcoming environment for students, faculty, and staff.
            </p>
            
            {/* Newsletter Subscription */}
            <div className="mt-6">
              <h4 className="text-lg font-bold text-orange-500 mb-3">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-3">
                Get our daily specials and promotions
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 bg-gray-800 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 text-sm"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Column 2: Our Menu Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-xl font-bold text-orange-500 mb-4">Our Menu</h4>
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-orange-500">
                    {service.icon}
                  </div>
                  <Link
                    href={service.link}
                    className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                  >
                    {service.title}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <FaLeaf className="text-green-500" />
                <span>Fresh ingredients daily</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                <FaTruck className="text-blue-500" />
                <span>Campus-wide delivery available</span>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-xl font-bold text-orange-500 mb-4">Quick Links</h4>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-orange-500">
                    {link.icon}
                  </div>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Student Resources */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="text-orange-500 font-bold mb-3">Student Resources</h5>
              <div className="space-y-2">
                <Link href="/meal-plans" className="text-gray-400 hover:text-orange-400 text-sm block">
                  Meal Plan Information
                </Link>
                <Link href="/nutrition" className="text-gray-400 hover:text-orange-400 text-sm block">
                  Nutrition Facts
                </Link>
                <Link href="/allergies" className="text-gray-400 hover:text-orange-400 text-sm block">
                  Allergy Information
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Column 4: Contact & Social */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-xl font-bold text-orange-500 mb-4">Contact Us</h4>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3"
                >
                  <div className="text-orange-500 mt-1">
                    {contact.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-300 text-sm">{contact.text}</p>
                    <p className="text-gray-400 text-sm whitespace-pre-line">{contact.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Media */}
            <div className="pt-6 border-t border-gray-700">
              <h4 className="text-xl font-bold text-orange-500 mb-4">Follow Us</h4>
              <p className="text-gray-400 text-sm mb-4">
                See daily specials, photos, and updates
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, y: -3 }}
                    className="text-orange-500 hover:text-orange-400 transition-colors bg-gray-800 p-3 rounded-full"
                  >
                    <span className="text-xl">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copyright & Bottom Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Campus Café. All rights reserved.
              </p>
            </div>
            
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;