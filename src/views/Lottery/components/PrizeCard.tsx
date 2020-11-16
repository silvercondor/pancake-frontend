import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { Button } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import Card from 'components/Card'
import CardContent from 'components/CardContent'
import CardIcon from 'components/CardIcon'
import Label from 'components/Label'
import Value from 'components/Value'
import useModal from 'hooks/useModal'
import { getBalanceNumber } from 'utils/formatBalance'
import useGetLotteryHasDrawn from 'hooks/useGetLotteryHasDrawn'
import { useMultiClaimLottery } from 'hooks/useBuyLottery'
import useTickets, { useTotalClaim } from 'hooks/useTickets'
import WalletProviderModal from 'components/WalletProviderModal'
import Loading from 'components/Loading'
import UserTicketsModal from './UserTicketsModal'

const PrizeCard: React.FC = () => {
  const [requesteClaim, setRequestedClaim] = useState(false)
  const { account } = useWallet()
  const TranslateString = useI18n()
  const tickets = useTickets()
  const [onPresentMyTickets] = useModal(<UserTicketsModal myTicketNumbers={tickets} />)
  const lotteryHasDrawn = useGetLotteryHasDrawn()
  const { claimLoading, claimAmount } = useTotalClaim()

  const { onMultiClaim } = useMultiClaimLottery()

  const handleClaim = useCallback(async () => {
    try {
      setRequestedClaim(true)
      const txHash = await onMultiClaim()
      // user rejected tx or didn't go thru
      if (txHash) {
        setRequestedClaim(false)
      }
    } catch (e) {
      console.error(e)
    }
  }, [onMultiClaim, setRequestedClaim])

  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />, 'provider')
  const handleUnlockClick = useCallback(() => {
    onPresentWalletProviderModal()
  }, [onPresentWalletProviderModal])

  return (
    <div style={{ margin: '5px', width: '380px' }}>
      <Card>
        <CardContent>
          <StyledCardContentInner>
            <StyledCardHeader>
              <CardIcon>🎁</CardIcon>
              {claimLoading && <Loading />}
              {!claimLoading && <Value value={getBalanceNumber(claimAmount)} />}
              <Label text={TranslateString(482, 'CAKE prizes to be claimed!')} />
            </StyledCardHeader>
            <StyledCardActions>
              {!account && (
                <Button fullWidth onClick={handleUnlockClick}>
                  {TranslateString(292, 'Unlock Wallet')}
                </Button>
              )}
              {account && (
                <Button fullWidth disabled={getBalanceNumber(claimAmount) == 0 || requesteClaim} onClick={handleClaim}>
                  {TranslateString(480, 'Claim prizes')}
                </Button>
              )}
            </StyledCardActions>
            {account && lotteryHasDrawn ? (
              <MyTicketsP onClick={onPresentMyTickets}>View your tickets</MyTicketsP>
            ) : (
              <>
                <br />
                <br />
              </>
            )}
          </StyledCardContentInner>
        </CardContent>
      </Card>
    </div>
  )
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`

const MyTicketsP = styled.div`
  cursor: pointer;
  margin-top: 1.35em;
  color: ${(props) => props.theme.colors.secondary};
`

export default PrizeCard