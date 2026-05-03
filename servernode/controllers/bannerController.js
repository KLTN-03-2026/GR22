// Module: controllers/bannerController.js - Quản lý logic hệ thống
const { Banner } = require('../models');
const fs = require('fs');
const path = require('path');

// Get all active banners for users
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { status: 'active' },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all banners for admin
exports.adminGetBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link, order } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Vui lòng tải lên hình ảnh banner' });

    const imageUrl = `/uploads/${req.file.filename}`;
    const banner = await Banner.create({
      title,
      link,
      imageUrl,
      order: order || 0,
      status: 'active'
    });

    res.status(201).json(banner);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Không tìm thấy banner' });

    const { title, link, status, order } = req.body;
    let imageUrl = banner.imageUrl;

    if (req.file) {
      // Delete old image if exists
      const oldPath = path.join(__dirname, '..', banner.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    await banner.update({ title, link, status, order, imageUrl });
    res.json(banner);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Không tìm thấy banner' });

    // Delete image file
    const imagePath = path.join(__dirname, '..', banner.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await banner.destroy();
    res.json({ message: 'Đã xóa banner thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Git update: Triggering change for push
