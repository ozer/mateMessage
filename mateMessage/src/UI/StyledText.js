import React from 'react';
import { color,
    space,
    letterSpacing,
    fontSize,
    fontWeight,
    fontStyle,
    textAlign,
    flex,
    flexDirection,
    compose
} from 'styled-system';
import styled from '@emotion/native';
import {textType} from "../theme/styleUtils";

const StyledText = styled.Text(
    textType,
    compose(
        color,
        letterSpacing,
        fontSize,
        fontWeight,
        fontStyle,
        textAlign,
        flex,
        flexDirection,
        space
    )
);

StyledText.defaultProps = {
    type: 'default',
};

StyledText.displayName = 'StyledText';

export default StyledText;