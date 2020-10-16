import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { css, ClassNames } from '@emotion/core';
import { isMdxType } from '../utils/mdx';
import { isShellCommand, isCodeBlock } from '../utils/codeBlock';

const isCodeLikeBlock = (child) =>
  isShellCommand(child) ||
  isCodeBlock(child) ||
  isMdxType(child, 'TutorialEditor');

const last = (arr) => arr[arr.length - 1];

const findIndexes = (arr, predicate) =>
  arr.reduce(
    (memo, item, idx) => (predicate(item) ? [...memo, idx] : memo),
    []
  );

const TutorialStep = ({ children, stepNumber, totalSteps }) => {
  children = Children.toArray(children);

  const title = isMdxType(children[0], 'h3') ? children[0] : null;
  const content = title
    ? children.filter((child) => child !== title)
    : children;

  const codeBlockIndexes = findIndexes(content, isCodeLikeBlock);

  const columns = codeBlockIndexes
    .reduce((memo, boundary, idx) => {
      const previousIdx = idx === 0 ? 0 : codeBlockIndexes[idx - 1] + 1;

      return [
        ...memo,
        ...content.slice(previousIdx, boundary - 1),
        [content[boundary - 1], content[boundary]],
      ];
    }, [])
    .concat(content.slice(last(codeBlockIndexes) + 1));

  return (
    <div
      css={css`
        padding: 2rem 0;
        border-top: 1px solid var(--divider-color);

        &:last-child {
          border-bottom: 1px solid var(--divider-color);
        }
      `}
    >
      <StepCounter stepNumber={stepNumber} total={totalSteps} />
      {title && (
        <ClassNames>
          {({ css }) =>
            cloneElement(title, {
              className: css`
                font-size: 1rem;
                font-weight: bold;
                margin-top: 0 !important;
              `,
            })
          }
        </ClassNames>
      )}
      {columns.map((column, idx) => {
        return Array.isArray(column) ? (
          <div
            key={idx}
            css={css`
              display: grid;
              grid-template-columns: repeat(2, calc(50% - 0.5rem));
              grid-gap: 1rem;

              &:not(:last-child) {
                margin-bottom: 2rem;
              }
            `}
          >
            <div>{column[0]}</div>
            <div>{column[1]}</div>
          </div>
        ) : (
          column
        );
      })}
    </div>
  );
};

TutorialStep.propTypes = {
  children: PropTypes.node,
  stepNumber: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
};

const StepCounter = ({ className, stepNumber, total }) => (
  <div
    className={className}
    css={css`
      --accent-size: 1.2em;

      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-text-color);
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    `}
  >
    Step{' '}
    <span
      css={css`
        font-size: var(--accent-size);
      `}
    >
      {stepNumber}
    </span>{' '}
    of{' '}
    <span
      css={css`
        font-size: var(--accent-size);
      `}
    >
      {total}
    </span>
  </div>
);

StepCounter.propTypes = {
  className: PropTypes.string,
  stepNumber: PropTypes.number,
  total: PropTypes.number,
};

export default TutorialStep;
