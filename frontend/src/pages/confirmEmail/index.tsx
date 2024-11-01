import { useMutation } from '@tanstack/react-query'
import { Flex, Spin, Typography } from 'antd'
import api from 'api'
import React, { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { parseUseQueryError } from 'shared/utils/errors'
import { useAuthStore } from 'store/auth'
import styled from 'styled-components'

const CenteredTypography = styled(Typography)`
    height: 100%;

	padding: 0 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
`

const ConfirmEmail: React.FC = () => {
    const user = useAuthStore((state) => state.user)

    const navigate = useNavigate()

    const [searchParams] = useSearchParams()

    const { mutateAsync, isPending, error } = useMutation({
        mutationFn: api.auth.confirmEmail
    })

    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const token = useMemo(() => searchParams.get('token'), [searchParams])
    const parsedError = useMemo(() => parseUseQueryError(error, undefined, [400, 401]), [error])

    useEffect(() => {
        if (!token) {
            return
        }

        mutateAsync({ token: token }).then(
            () =>
                (redirectTimeoutRef.current = setTimeout(() => {
                    navigate(user ? '/profile' : '/login', { replace: true })
                }, 5000))
        )

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current)
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!token) {
        return (
            <CenteredTypography>
                <Typography.Title level={3}>Verification Error</Typography.Title>

                <Typography.Paragraph>
                    Unfortunately, the token for confirming your email is missing. Please check the
                    link you used to access this page.
                </Typography.Paragraph>

                <Typography.Paragraph>
                    If you did not receive the confirmation email or the link no longer works, you
                    can request a new verification email.
                </Typography.Paragraph>

                <Link to={user ? '/profile' : '/login'}>back to main page</Link>
            </CenteredTypography>
        )
    }

    if (isPending) {
        return (
            <Flex justify="center" vertical align="center" className="h-full w-full">
                <Typography.Title level={3}>Confirming Email</Typography.Title>

                <Spin size="large" />
            </Flex>
        )
    }

    if (error) {
        return (
            <CenteredTypography>
                <Typography.Title level={3}>Verification Error</Typography.Title>

                <Typography.Paragraph>
                    An error occurred while confirming your email Reason: {parsedError}. Please
                    check the link you used to access this page or request a new verification email.
                </Typography.Paragraph>

                <Link to={user ? '/profile' : '/login'}>back to main page</Link>
            </CenteredTypography>
        )
    }

    return (
        <CenteredTypography>
            <Typography.Title level={3}>Email Confirmed</Typography.Title>

            <Typography.Paragraph>
                Your email has been successfully confirmed. You have full access to the platform.
            </Typography.Paragraph>

            <Typography.Paragraph>
                You will be redirected to the main page in 5 seconds.
            </Typography.Paragraph>

            <Link to={user ? '/profile' : '/login'} replace>back to main page</Link>
        </CenteredTypography>
    )
}

export default ConfirmEmail
