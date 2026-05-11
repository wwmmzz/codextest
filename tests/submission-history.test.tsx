import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SubmissionHistory } from '../src/components/SubmissionHistory'
import type { SubmissionRecord } from '../src/types/submission'

const submission: SubmissionRecord = {
  id: 'request-1',
  problemId: 'two-sum',
  problemTitle: 'Two Sum',
  code: 'function twoSum(nums, target) { return [0, 1] }',
  status: 'accepted',
  passedCount: 4,
  totalCount: 4,
  durationMs: 12,
  result: {
    requestId: 'request-1',
    problemId: 'two-sum',
    mode: 'submit',
    status: 'accepted',
    passedCount: 4,
    totalCount: 4,
    durationMs: 12,
    cases: [
      {
        testCaseId: 'case-1',
        status: 'passed',
        durationMs: 3,
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        actual: [0, 1],
      },
    ],
  },
  submittedAt: 1700000000000,
}

describe('SubmissionHistory', () => {
  it('opens submission details from the table', async () => {
    render(
      <MemoryRouter>
        <SubmissionHistory
          submissions={[submission]}
          loading={false}
          error={null}
          showProblemLink
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /查看/ }))

    await waitFor(() => {
      expect(screen.getByText('提交详情')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Two Sum')).toBeInTheDocument()
    expect(
      within(dialog).getByText('function twoSum(nums, target) { return [0, 1] }'),
    ).toBeInTheDocument()
  })

  it('renders an empty state when there are no submissions', () => {
    render(
      <MemoryRouter>
        <SubmissionHistory submissions={[]} loading={false} error={null} />
      </MemoryRouter>,
    )

    expect(screen.getByText('暂无提交记录')).toBeInTheDocument()
  })
})
