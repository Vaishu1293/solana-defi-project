use anchor_lang::prelude::*;

declare_id!("FVVTSH5xRtir25Eq28KHsn9jQffBJ5NE1GZJgnPYPTXW");

#[program]
pub mod crowd_funding {
    use super::*;
    
    pub fn create(ctx: Context<Create>, name: String, description: String) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        campaign.admin = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.account.campaign;
        let user = &mut ctx.accounts.user;
        if campaign.admin != *user.key{
            return Err(ProgramError::IncorrectProgramId);
        }
    }
    
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], bump)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>
    pub system_program: Program<'info, System>
}

#[account]
pub struct Campaign {
    pub admin: PubKey,
    pub name: String,
    pub description: String,
    pub amount_donated: u64
}
