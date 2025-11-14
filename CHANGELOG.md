# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-14

### Added
- 🌐 Complete Web UI with 5-step wizard
- 📦 In-memory storage (H2-like) for collections
- ⏰ Auto-expiry for collections (1 hour)
- 📥 Multiple download options (individual files & all-in-one)
- ✅ QA validation features
  - Expected response validation
  - Field validation
  - SQL validation
- 🧪 Comprehensive Playwright test suite
- 📚 Extensive documentation in `docs/` folder
- 🔐 Enhanced authentication support (None, Basic, Bearer)
- 🗄️ H2 in-memory database support
- 🎨 Modern, responsive UI design

### Changed
- Migrated from file-based storage to in-memory storage
- Improved error handling and user feedback
- Enhanced test scenario generation
- Restructured project organization
- Updated dependencies to latest versions

### Fixed
- File download issues on various browsers
- Database connection timeout problems
- Authentication handling edge cases
- Collection generation race conditions

### Documentation
- Added comprehensive README.md
- Created detailed user guides
- Added deployment guides (Local & AWS)
- Included troubleshooting documentation
- Added architecture documentation

## [1.0.0] - 2024-12-01

### Added
- Initial release
- Basic CLI generator
- MSSQL database integration
- Bruno collection generation
- Positive and negative test scenarios
- Basic authentication support
- File-based storage

---

## Upcoming Features

See [Roadmap](README.md#-roadmap) for planned features.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
