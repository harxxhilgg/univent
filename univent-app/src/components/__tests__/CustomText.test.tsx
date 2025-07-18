import React from 'react';
import CustomText from '../CustomText';
import { render } from '@testing-library/react-native';

describe('CustomText Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<CustomText>Helloww World</CustomText>);
    const text = getByText('Helloww World');

    expect(text).toBeTruthy();
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 16, lineHeight: 26 }),
        expect.objectContaining({ fontFamily: 'Inter-Regular' }),
      ])
    );
  });

  it('applies Inter-Bold when bold prop is true', () => {
    const { getByText } = render(<CustomText bold>Bold Text</CustomText>);
    const text = getByText('Bold Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontFamily: 'Inter-Bold' }),
      ])
    );
  });

  it('applies Inter-SemiBold  when semibold prop is true', () => {
    const { getByText } = render(<CustomText semibold>SemiBold Text</CustomText>);
    const text = getByText('SemiBold Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontFamily: 'Inter-SemiBold' }),
      ])
    );
  });

  it('applies custom styles passed via style prop', () => {
    const { getByText } = render(
      <CustomText style={{ color: 'purple' }}>Styled Text</CustomText>
    );
    const text = getByText('Styled Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: 'purple' }),
      ])
    );
  });
})