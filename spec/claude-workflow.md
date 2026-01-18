# Spec-Driven Claude Code Workflow

## The Command
```bash
cat prompt.md | claude --dangerously-skip-permissions
```

## prompt.md Template
```markdown
Investigate the spec at <spec-file>.md
Determine the highest priority task to work on.
Complete the task
Run quality checks (pre-commit and npm run validate:all)
Update the task in the spec to mark it as done
Make a commit with the new feature
Append your progress to progress.json

IMPORTANT

- Work on only one task
- Keep the CI/checks working

When no more tasks are workable output <promise>COMPLETE</promise>
```

## Key Elements

1. **Spec file** - A markdown file with prioritized tasks (checkboxes work well)
2. **Quality gate** - Validation command that must pass before committing
3. **Progress tracking** - JSON file to log completed work
4. **Exit signal** - `<promise>COMPLETE</promise>` tells you when all tasks are done

## Running in a Loop
```bash
while ! cat prompt.md | claude --dangerously-skip-permissions 2>&1 | grep -q "COMPLETE"; do
  echo "--- Task completed, continuing ---"
done
```

## Tips

- Keep specs granular - one feature = one checkbox
- Use `--dangerously-skip-permissions` only in sandboxed/dev environments
- Check `progress.json` to see what was done between runs
