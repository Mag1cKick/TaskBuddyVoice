# Contributing to Task Buddy Voice

Thank you for your interest in contributing to Task Buddy Voice! This document provides guidelines and instructions for contributing.

## Development Workflow

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/TaskBuddyVoice.git
cd TaskBuddyVoice
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Make Changes

- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run linter
npm run lint
```

### 6. Commit Changes

Follow conventional commit format:

```bash
git commit -m "feat: add new voice command"
git commit -m "fix: resolve parsing issue with dates"
git commit -m "docs: update testing documentation"
git commit -m "test: add edge cases for voice parser"
```

#### Commit Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### 7. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title Format

Use conventional commit format:
```
feat: Add voice command for task priorities
fix: Resolve weekly digest crash on empty tasks
docs: Update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing locally
- [ ] Coverage maintained or improved

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added for new functionality
- [ ] All edge cases considered

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

## Code Style Guidelines

### TypeScript

```typescript
// ✅ Good: Type-safe, descriptive names
interface TaskData {
  id: string
  title: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
}

function createTask(data: TaskData): Promise<Task> {
  // Implementation
}

// ❌ Bad: No types, unclear names
function create(d: any) {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Props interface, destructured, typed
interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div>
      {/* Component implementation */}
    </div>
  )
}

// ❌ Bad: No types, props passed directly
export function TaskCard(props) {
  return <div>{/* ... */}</div>
}
```

### Testing

```typescript
// ✅ Good: Descriptive, organized, comprehensive
describe('voiceTaskParser', () => {
  describe('Date parsing', () => {
    it('should parse "tomorrow" as next day', () => {
      const result = parseVoiceInput('meeting tomorrow')
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(result.dueDate).toBe(tomorrow.toISOString().split('T')[0])
    })
  })
})

// ❌ Bad: Vague, incomplete
test('parser works', () => {
  const result = parseVoiceInput('test')
  expect(result).toBeTruthy()
})
```

## Testing Requirements

### For New Features

1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test feature end-to-end
3. **Edge Cases**: Test boundary conditions
4. **Error Handling**: Test failure scenarios

### Coverage Requirements

- Maintain >80% code coverage
- All new code must have tests
- Critical paths must have 100% coverage

### Running Tests Before PR

```bash
# Full test suite
npm test

# With coverage
npm run test:coverage

# Integration tests
npm test -- tests/integration
```

## CI/CD Pipeline

Your PR will automatically trigger:

1. ✅ **Lint Check** - ESLint + TypeScript
2. ✅ **Tests** - All unit & integration tests
3. ✅ **Build** - Production build verification
4. ✅ **Security** - Vulnerability scan
5. ✅ **Coverage** - Code coverage analysis
6. ✅ **Performance** - Bundle size check

All checks must pass before merge.

## Code Review Process

### What to Expect

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: Comments and requested changes
4. **Iteration**: Make updates based on feedback
5. **Approval**: Once approved, PR will be merged

### Review Criteria

- ✅ Code quality and readability
- ✅ Test coverage and quality
- ✅ Documentation completeness
- ✅ Performance considerations
- ✅ Security best practices
- ✅ Backward compatibility

## Common Issues & Solutions

### Tests Failing in CI but Passing Locally

```bash
# Use same Node version as CI
nvm use 20

# Clear cache
rm -rf node_modules coverage
npm install

# Run tests
npm test
```

### Linting Errors

```bash
# Auto-fix issues
npm run lint -- --fix

# Check specific file
npm run lint -- path/to/file.ts
```

### Type Errors

```bash
# Check types
npx tsc --noEmit

# Check specific file
npx tsc --noEmit path/to/file.ts
```

## Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs via GitHub Issues
- 📧 **Email**: Contact maintainers directly
- 📖 **Docs**: Check TESTING.md for testing guidance

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Task Buddy Voice! 🎉

